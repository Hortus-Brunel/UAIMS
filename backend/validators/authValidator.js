const { body } = require('express-validator');

// Matricule pattern: 2 uppercase letters + 2 digits + 1 uppercase letter + 3-4 digits
// Example: FE24A228
const MATRICULE_REGEX = /^[A-Z]{2}\d{2}[A-Z]\d{3,4}$/;

/**
 * Validation rules for user registration.
 */
const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 150 }).withMessage('Full name must be between 2 and 150 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('matricule')
    .trim()
    .notEmpty().withMessage('Matricule is required.')
    .toUpperCase()
    .matches(MATRICULE_REGEX)
    .withMessage('Invalid matricule format. Expected format: FE24A228 (2 letters + 2 digits + 1 letter + 3-4 digits).'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*).'),

  body('primaryFacultyId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid faculty ID.'),

  body('primaryDepartmentId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid department ID.'),

  body('levelId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid academic level ID.'),

  body('programmeId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid programme ID.'),
];

/**
 * Validation rules for user login.
 * Accepts either email or matricule + password.
 */
const loginValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('matricule')
    .optional()
    .trim()
    .toUpperCase()
    .matches(MATRICULE_REGEX)
    .withMessage('Invalid matricule format.'),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.matricule) {
      throw new Error('Either email or matricule is required.');
    }
    return true;
  }),
];

/**
 * Validation rules for password reset request.
 */
const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),
];

/**
 * Validation rules for resetting the password with a token.
 */
const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required.'),

  body('password')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*).'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

/**
 * Validation rules for changing the password (authenticated).
 */
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Must contain at least one number.')
    .matches(/[!@#$%^&*]/).withMessage('Must contain at least one special character (!@#$%^&*).')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must differ from current password.');
      }
      return true;
    }),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
