const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/db');
const { signAccessToken, signRefreshToken, buildTokenPayload } = require('../utils/jwt');
const { logAudit } = require('../middlewares/audit');
const logger = require('../config/logger');

const BCRYPT_ROUNDS = 12;

/**
 * Register a new user account.
 * Accepts external email domains (including Gmail).
 */
async function registerUser({ fullName, email, matricule, password, primaryFacultyId, primaryDepartmentId, levelId, programmeId }) {
  // Check for existing email or matricule
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { matricule: matricule.toUpperCase() },
      ],
    },
    select: { id: true, email: true, matricule: true },
  });

  if (existing) {
    if (existing.email === email.toLowerCase()) {
      throw Object.assign(new Error('An account with this email already exists.'), { statusCode: 409 });
    }
    throw Object.assign(new Error('An account with this matricule already exists.'), { statusCode: 409 });
  }

  // Validate foreign keys exist if provided
  if (primaryFacultyId) {
    const faculty = await prisma.faculty.findUnique({ where: { id: primaryFacultyId } });
    if (!faculty) throw Object.assign(new Error('Faculty not found.'), { statusCode: 404 });
  }

  if (primaryDepartmentId) {
    const dept = await prisma.department.findUnique({ where: { id: primaryDepartmentId } });
    if (!dept) throw Object.assign(new Error('Department not found.'), { statusCode: 404 });
  }

  if (levelId) {
    const level = await prisma.academicLevel.findUnique({ where: { id: levelId } });
    if (!level) throw Object.assign(new Error('Academic level not found.'), { statusCode: 404 });
  }

  if (programmeId) {
    const prog = await prisma.programme.findUnique({ where: { id: programmeId } });
    if (!prog) throw Object.assign(new Error('Programme not found.'), { statusCode: 404 });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      matricule: matricule.toUpperCase(),
      passwordHash,
      primaryFacultyId: primaryFacultyId || null,
      primaryDepartmentId: primaryDepartmentId || null,
      levelId: levelId || null,
      programmeId: programmeId || null,
      isEmailVerified: false,
      isActive: true,
      accessLevel: 'L0_STUDENT',
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      matricule: true,
      accessLevel: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Also create a department membership record if dept provided
  if (primaryDepartmentId) {
    await prisma.userDepartmentMembership.create({
      data: {
        userId: user.id,
        departmentId: primaryDepartmentId,
        roleInDept: 'member',
      },
    }).catch(() => {}); // Silently ignore if already exists
  }

  await logAudit({
    actorId: user.id,
    action: 'USER_REGISTERED',
    targetTable: 'users',
    targetId: user.id,
    metadata: { email: user.email, matricule: user.matricule },
  });

  logger.info('New user registered: %s (%s)', user.email, user.matricule);

  return user;
}

/**
 * Authenticate a user by email OR matricule + password.
 * Returns signed access and refresh tokens.
 * @param {object} credentials
 * @param {string} [credentials.email]
 * @param {string} [credentials.matricule]
 * @param {string} credentials.password
 * @param {string} ipAddress - request IP for audit
 */
async function loginUser({ email, matricule, password }, ipAddress) {
  // Find user by email or matricule
  const whereClause = email
    ? { email: email.toLowerCase() }
    : { matricule: matricule.toUpperCase() };

  const user = await prisma.user.findUnique({
    where: whereClause,
    include: {
      primaryFaculty: { select: { id: true, name: true, shortCode: true } },
      primaryDepartment: { select: { id: true, name: true, shortCode: true } },
      level: { select: { id: true, name: true } },
      programme: { select: { id: true, name: true } },
    },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid credentials.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Your account has been deactivated. Contact support.'), { statusCode: 403 });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw Object.assign(new Error('Invalid credentials.'), { statusCode: 401 });
  }

  // Build token payload and sign tokens
  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  // Persist refresh token to DB
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  await logAudit({
    actorId: user.id,
    action: 'USER_LOGIN',
    targetTable: 'users',
    targetId: user.id,
    ipAddress,
  });

  const { passwordHash: _, ...safeUser } = user;

  return { accessToken, refreshToken, user: safeUser };
}

/**
 * Refresh the access token using a valid refresh token.
 */
const { verifyRefreshToken } = require('../utils/jwt');

async function refreshAccessToken(incomingRefreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token.'), { statusCode: 401 });
  }

  // Verify the token exists in DB (not revoked)
  const stored = await prisma.refreshToken.findUnique({
    where: { token: incomingRefreshToken },
    include: { user: true },
  });

  if (!stored || stored.userId !== decoded.id) {
    throw Object.assign(new Error('Refresh token not recognised.'), { statusCode: 401 });
  }

  if (new Date() > stored.expiresAt) {
    await prisma.refreshToken.delete({ where: { token: incomingRefreshToken } });
    throw Object.assign(new Error('Refresh token expired. Please log in again.'), { statusCode: 401 });
  }

  if (!stored.user.isActive) {
    throw Object.assign(new Error('Account is inactive.'), { statusCode: 403 });
  }

  const newAccessToken = signAccessToken(buildTokenPayload(stored.user));

  return { accessToken: newAccessToken };
}

/**
 * Revoke a refresh token on logout.
 */
async function logoutUser(refreshToken, userId) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId },
    });
  }
  await logAudit({ actorId: userId, action: 'USER_LOGOUT', targetTable: 'users', targetId: userId });
}

/**
 * Generate a password reset token and record it.
 * In production this would send an email; here we return the token.
 */
async function initiatePasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond with success message to prevent email enumeration
  if (!user) return null;

  // Generate a secure random token (hex)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store as a refresh-token record tagged as password reset
  // In production, store in a dedicated password_resets table or email the link
  await prisma.refreshToken.upsert({
    where: { token: `reset_${user.id}` },
    update: { token: resetToken, expiresAt },
    create: { userId: user.id, token: resetToken, expiresAt },
  });

  await logAudit({ actorId: user.id, action: 'PASSWORD_RESET_REQUESTED', targetTable: 'users', targetId: user.id });

  logger.info('Password reset requested for: %s', email);
  return resetToken; // In production send via email
}

/**
 * Complete a password reset using the token.
 */
async function completePasswordReset(token, newPassword) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || new Date() > stored.expiresAt) {
    throw Object.assign(new Error('Reset token is invalid or has expired.'), { statusCode: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: stored.userId },
    data: { passwordHash, updatedAt: new Date() },
  });

  // Delete the used reset token
  await prisma.refreshToken.delete({ where: { token } });

  await logAudit({ actorId: stored.userId, action: 'PASSWORD_RESET_COMPLETED', targetTable: 'users', targetId: stored.userId });
}

/**
 * Change password for an authenticated user.
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    throw Object.assign(new Error('Current password is incorrect.'), { statusCode: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, updatedAt: new Date() },
  });

  // Revoke all existing refresh tokens (force re-login on all devices)
  await prisma.refreshToken.deleteMany({ where: { userId } });

  await logAudit({ actorId: userId, action: 'PASSWORD_CHANGED', targetTable: 'users', targetId: userId });
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  initiatePasswordReset,
  completePasswordReset,
  changePassword,
};
