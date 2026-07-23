const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * POST /api/auth/register
 * Register a new user. All fields validated by authValidator.registerValidator.
 */
async function register(req, res, next) {
  try {
    const { fullName, email, matricule, password, primaryFacultyId, primaryDepartmentId, levelId, programmeId } = req.body;

    const user = await authService.registerUser({
      fullName,
      email,
      matricule,
      password,
      primaryFacultyId,
      primaryDepartmentId,
      levelId,
      programmeId,
    });

    return successResponse(
      res,
      'Account created successfully. Please verify your email to activate your account.',
      { user },
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email OR matricule + password.
 * Returns accessToken and refreshToken.
 */
async function login(req, res, next) {
  try {
    const { email, matricule, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    const result = await authService.loginUser({ email, matricule, password }, ipAddress);

    return successResponse(res, 'Login successful.', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required.', [], 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return successResponse(res, 'Token refreshed.', result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Revoke the refresh token. authenticate() middleware must run before this.
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken, req.user.id);
    return successResponse(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Initiate password reset flow. Returns reset token in dev mode.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const token = await authService.initiatePasswordReset(email);

    // Always return success to prevent email enumeration
    const data = process.env.NODE_ENV !== 'production' && token ? { resetToken: token } : {};

    return successResponse(
      res,
      'If an account with that email exists, a password reset link has been sent.',
      data
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Complete password reset with a valid token.
 */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    await authService.completePasswordReset(token, password);
    return successResponse(res, 'Password reset successful. You can now log in with your new password.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/change-password
 * Change password for an authenticated user.
 * Requires authenticate() middleware.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, 'Password changed successfully. Please log in again on all devices.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Return the current authenticated user profile.
 */
async function getMe(req, res) {
  return successResponse(res, 'Profile retrieved.', { user: req.user });
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, changePassword, getMe };
