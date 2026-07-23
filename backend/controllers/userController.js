const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/users/me — own full profile
async function getOwnProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    return successResponse(res, 'Profile retrieved.', { user });
  } catch (err) { next(err); }
}

// GET /api/users/:userId — get any user (admin L2+)
async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.userId);
    return successResponse(res, 'User retrieved.', { user });
  } catch (err) { next(err); }
}

// GET /api/users — list users with filters (admin L2+)
async function listUsers(req, res, next) {
  try {
    const { page, limit, accessLevel, facultyId, departmentId, search } = req.query;
    const result = await userService.listUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      accessLevel,
      facultyId,
      departmentId,
      search,
    });
    return successResponse(res, 'Users retrieved.', result);
  } catch (err) { next(err); }
}

// PATCH /api/users/:userId — update profile (self or admin)
async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateUserProfile(req.params.userId, req.body, req.user.id);
    return successResponse(res, 'Profile updated successfully.', { user });
  } catch (err) { next(err); }
}

// PATCH /api/users/:userId/toggle-status — activate/deactivate (L3+)
async function toggleStatus(req, res, next) {
  try {
    const result = await userService.toggleUserStatus(req.params.userId, req.user.id);
    return successResponse(res, `User ${result.isActive ? 'activated' : 'deactivated'} successfully.`, { user: result });
  } catch (err) { next(err); }
}

// PATCH /api/users/:userId/access-level — promote/demote (L2+)
async function changeAccessLevel(req, res, next) {
  try {
    const result = await userService.changeUserAccessLevel(req.params.userId, req.body.accessLevel, req.user);
    return successResponse(res, `Access level updated to ${result.accessLevel}.`, { user: result });
  } catch (err) { next(err); }
}

// POST /api/users/:userId/classes — add class membership (admin)
async function addClassMembership(req, res, next) {
  try {
    const { classId, isRep } = req.body;
    const membership = await userService.addClassMembership(req.params.userId, classId, isRep, req.user.id);
    return successResponse(res, 'User added to class.', { membership }, 201);
  } catch (err) { next(err); }
}

// DELETE /api/users/:userId/classes/:classId — remove class membership
async function removeClassMembership(req, res, next) {
  try {
    await userService.removeClassMembership(req.params.userId, req.params.classId, req.user.id);
    return successResponse(res, 'User removed from class.');
  } catch (err) { next(err); }
}

// POST /api/users/:userId/clubs — add club membership (admin)
async function addClubMembership(req, res, next) {
  try {
    const { clubId, isLeader } = req.body;
    const membership = await userService.addClubMembership(req.params.userId, clubId, isLeader, req.user.id);
    return successResponse(res, 'User added to club.', { membership }, 201);
  } catch (err) { next(err); }
}

module.exports = {
  getOwnProfile,
  getUserById,
  listUsers,
  updateProfile,
  toggleStatus,
  changeAccessLevel,
  addClassMembership,
  removeClassMembership,
  addClubMembership,
};
