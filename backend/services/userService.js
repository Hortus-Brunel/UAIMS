const prisma = require('../config/db');
const { logAudit } = require('../middlewares/audit');
const logger = require('../config/logger');
const { LEVEL_ORDER } = require('../middlewares/auth');

/**
 * Get a single user by ID with their full profile.
 */
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      matricule: true,
      accessLevel: true,
      avatarUrl: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      primaryFaculty: { select: { id: true, name: true, shortCode: true } },
      primaryDepartment: { select: { id: true, name: true, shortCode: true } },
      level: { select: { id: true, name: true } },
      programme: { select: { id: true, name: true } },
      classMemberships: {
        select: {
          isRep: true,
          class: { select: { id: true, name: true, academicYear: true } },
        },
      },
      clubMemberships: {
        select: {
          isLeader: true,
          club: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  return user;
}

/**
 * List users with filters, pagination, and search.
 */
async function listUsers({ page = 1, limit = 20, accessLevel, facultyId, departmentId, search } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(accessLevel && { accessLevel }),
    ...(facultyId && { primaryFacultyId: facultyId }),
    ...(departmentId && { primaryDepartmentId: departmentId }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        matricule: true,
        accessLevel: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        primaryFaculty: { select: { name: true, shortCode: true } },
        primaryDepartment: { select: { name: true, shortCode: true } },
        level: { select: { name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update user profile (self or admin).
 */
async function updateUserProfile(userId, updateData, actorId) {
  const { fullName, avatarUrl, levelId, programmeId, primaryFacultyId, primaryDepartmentId } = updateData;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(levelId !== undefined && { levelId: levelId || null }),
      ...(programmeId !== undefined && { programmeId: programmeId || null }),
      ...(primaryFacultyId !== undefined && { primaryFacultyId: primaryFacultyId || null }),
      ...(primaryDepartmentId !== undefined && { primaryDepartmentId: primaryDepartmentId || null }),
    },
    select: {
      id: true, fullName: true, email: true, matricule: true,
      accessLevel: true, avatarUrl: true, levelId: true, programmeId: true,
      primaryFacultyId: true, primaryDepartmentId: true,
    },
  });

  await logAudit({ actorId, action: 'USER_PROFILE_UPDATED', targetTable: 'users', targetId: userId });
  return updated;
}

/**
 * Toggle user active/inactive status (admin only).
 */
async function toggleUserStatus(userId, actorId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true, email: true, matricule: true } });
  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });

  if (user.matricule === 'FE24A228') {
    throw Object.assign(new Error('Super account cannot be deactivated.'), { statusCode: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, isActive: true },
  });

  await logAudit({
    actorId,
    action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    targetTable: 'users',
    targetId: userId,
  });

  return updated;
}

/**
 * Promote or demote a user's access level.
 * Enforces hierarchy: you can only set a level below your own.
 *
 * @param {string} targetUserId - The user to promote/demote
 * @param {string} newLevel     - The target AccessLevel enum value
 * @param {object} actor        - The requesting user (from req.user)
 */
async function changeUserAccessLevel(targetUserId, newLevel, actor) {
  const actorLevel = LEVEL_ORDER[actor.accessLevel] ?? -1;
  const targetLevel = LEVEL_ORDER[newLevel] ?? -1;

  // Cannot assign a level equal to or above your own (except L5)
  if (actor.accessLevel !== 'L5_SUPER_ADMIN' && targetLevel >= actorLevel) {
    throw Object.assign(
      new Error('You cannot assign an access level equal to or higher than your own.'),
      { statusCode: 403 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, accessLevel: true, email: true, matricule: true } });
  if (!target) throw Object.assign(new Error('User not found.'), { statusCode: 404 });

  if (target.matricule === 'FE24A228') {
    throw Object.assign(new Error('Super account access level cannot be modified.'), { statusCode: 403 });
  }

  // Cannot demote another user above your own level
  const currentTargetLevel = LEVEL_ORDER[target.accessLevel] ?? -1;
  if (actor.accessLevel !== 'L5_SUPER_ADMIN' && currentTargetLevel >= actorLevel) {
    throw Object.assign(new Error('You cannot modify a user with equal or higher privileges.'), { statusCode: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { accessLevel: newLevel },
    select: { id: true, email: true, accessLevel: true },
  });

  // Notify the promoted/demoted user
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      message: `🎓 Your access level has been changed to ${newLevel.replace(/_/g, ' ')} by an administrator.`,
    },
  }).catch(() => {});

  await logAudit({
    actorId: actor.id,
    action: 'USER_ACCESS_LEVEL_CHANGED',
    targetTable: 'users',
    targetId: targetUserId,
    metadata: { from: target.accessLevel, to: newLevel },
  });

  logger.info(`User ${actor.email} changed ${updated.email} access level: ${target.accessLevel} → ${newLevel}`);
  return updated;
}

/**
 * Enroll a user in a class.
 */
async function addClassMembership(userId, classId, isRep, actorId) {
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) throw Object.assign(new Error('Class not found.'), { statusCode: 404 });

  const membership = await prisma.userClassMembership.upsert({
    where: { userId_classId: { userId, classId } },
    update: { isRep: !!isRep },
    create: { userId, classId, isRep: !!isRep },
  });

  await logAudit({ actorId, action: 'USER_ADDED_TO_CLASS', targetTable: 'user_class_memberships', targetId: userId, metadata: { classId } });
  return membership;
}

/**
 * Remove a user from a class.
 */
async function removeClassMembership(userId, classId, actorId) {
  await prisma.userClassMembership.delete({
    where: { userId_classId: { userId, classId } },
  }).catch(() => {
    throw Object.assign(new Error('Membership record not found.'), { statusCode: 404 });
  });

  await logAudit({ actorId, action: 'USER_REMOVED_FROM_CLASS', targetTable: 'user_class_memberships', targetId: userId });
}

/**
 * Enroll a user in a club.
 */
async function addClubMembership(userId, clubId, isLeader, actorId) {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw Object.assign(new Error('Club not found.'), { statusCode: 404 });

  const membership = await prisma.userClubMembership.upsert({
    where: { userId_clubId: { userId, clubId } },
    update: { isLeader: !!isLeader },
    create: { userId, clubId, isLeader: !!isLeader },
  });

  await logAudit({ actorId, action: 'USER_ADDED_TO_CLUB', targetTable: 'user_club_memberships', targetId: userId, metadata: { clubId } });
  return membership;
}

module.exports = {
  getUserById,
  listUsers,
  updateUserProfile,
  toggleUserStatus,
  changeUserAccessLevel,
  addClassMembership,
  removeClassMembership,
  addClubMembership,
};
