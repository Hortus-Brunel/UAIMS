const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const requestLogger = require('../middlewares/requestLogger');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/authValidator');

// POST /api/auth/register
router.post('/register', requestLogger, registerValidator, validate, authController.register);

// POST /api/auth/login
router.post('/login', requestLogger, loginValidator, validate, authController.login);

// POST /api/auth/refresh  (no auth required; just a valid refresh token in body)
router.post('/refresh', authController.refresh);

// POST /api/auth/logout  (must be authenticated)
router.post('/logout', authenticate, authController.logout);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

// POST /api/auth/change-password  (must be authenticated)
router.post('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);

// GET  /api/auth/me  (must be authenticated)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
