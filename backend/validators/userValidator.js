const { body, query, param } = require('express-validator');

/**
 * Validation rules for updating a user profile.
 */
const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Full name must be between 2 and 150 characters.'),

  body('avatarUrl')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      if (!value) return true; // Allow empty/null
      // Accept absolute URLs or relative paths starting with /
      const isAbsolute = /^(https?:\/\/|\/)/.test(value);
      if (!isAbsolute && !/^data:/.test(value)) {
        throw new Error('Avatar URL must be a valid URL or relative path.');
      }
      return true;
    }),

  body('levelId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid academic level ID.'),

  body('programmeId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid programme ID.'),

  body('primaryFacultyId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid faculty ID.'),

  body('primaryDepartmentId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid department ID.'),
];

/**
 * Validation rules for listing users (admins).
 */
const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('accessLevel').optional().isIn(['L0_STUDENT','L1_REP','L2_DEPT_ADMIN','L3_FACULTY_ADMIN','L4_UNIVERSITY_ADMIN','L5_SUPER_ADMIN']).withMessage('Invalid access level.'),
  query('departmentId').optional({ checkFalsy: true, nullable: true }).isUUID().withMessage('Invalid department ID.'),
  query('facultyId').optional({ checkFalsy: true, nullable: true }).isUUID().withMessage('Invalid faculty ID.'),
];

/**
 * Validation for promoting/demoting a user.
 */
const promoteUserValidator = [
  param('userId').isUUID().withMessage('Invalid user ID.'),
  body('accessLevel')
    .notEmpty().withMessage('Access level is required.')
    .isIn(['L0_STUDENT','L1_REP','L2_DEPT_ADMIN','L3_FACULTY_ADMIN','L4_UNIVERSITY_ADMIN','L5_SUPER_ADMIN'])
    .withMessage('Invalid access level.'),
];

/**
 * Validation for adding a user to a class.
 */
const addClassMembershipValidator = [
  param('userId').isUUID().withMessage('Invalid user ID.'),
  body('classId').notEmpty().isUUID().withMessage('Invalid class ID.'),
  body('isRep').optional().isBoolean().withMessage('isRep must be a boolean.'),
];

/**
 * Validation for adding a user to a club.
 */
const addClubMembershipValidator = [
  param('userId').isUUID().withMessage('Invalid user ID.'),
  body('clubId').notEmpty().isUUID().withMessage('Invalid club ID.'),
  body('isLeader').optional().isBoolean().withMessage('isLeader must be a boolean.'),
];

module.exports = {
  updateProfileValidator,
  listUsersValidator,
  promoteUserValidator,
  addClassMembershipValidator,
  addClubMembershipValidator,
};
