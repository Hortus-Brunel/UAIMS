const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  updateProfileValidator,
  listUsersValidator,
  promoteUserValidator,
  addClassMembershipValidator,
  addClubMembershipValidator,
} = require('../validators/userValidator');

// All user routes require authentication
router.use(authenticate);

// GET  /api/users/me
router.get('/me', userController.getOwnProfile);

// GET  /api/users  (L2+ admins)
router.get('/', authorize('L2_DEPT_ADMIN'), listUsersValidator, validate, userController.listUsers);

// GET  /api/users/:userId  (L2+ admins)
router.get('/:userId', authorize('L2_DEPT_ADMIN'), userController.getUserById);

// PATCH /api/users/:userId  (self or L2+ admin)
router.patch('/:userId', authorizeOwnerOrAdmin('L2_DEPT_ADMIN'), updateProfileValidator, validate, userController.updateProfile);

// PATCH /api/users/:userId/toggle-status  (L3+ admin)
router.patch('/:userId/toggle-status', authorize('L3_FACULTY_ADMIN'), userController.toggleStatus);

// PATCH /api/users/:userId/access-level  (L2+ admin)
router.patch('/:userId/access-level', authorize('L2_DEPT_ADMIN'), promoteUserValidator, validate, userController.changeAccessLevel);

// POST  /api/users/:userId/classes  (L2+ admin)
router.post('/:userId/classes', authorize('L2_DEPT_ADMIN'), addClassMembershipValidator, validate, userController.addClassMembership);

// DELETE /api/users/:userId/classes/:classId  (L2+ admin)
router.delete('/:userId/classes/:classId', authorize('L2_DEPT_ADMIN'), userController.removeClassMembership);

// POST  /api/users/:userId/clubs  (L2+ admin)
router.post('/:userId/clubs', authorize('L2_DEPT_ADMIN'), addClubMembershipValidator, validate, userController.addClubMembership);

module.exports = router;
