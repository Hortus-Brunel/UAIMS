const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const prisma = require('../config/db');
const logger = require('../config/logger');

/**
 * Authentication Middleware
 * Verifies the Bearer token in the Authorization header.
 * Attaches the decoded user and full DB record to req.user.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token is missing.', [], 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Fetch the user from DB to ensure the account is still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        matricule: true,
        accessLevel: true,
        primaryFacultyId: true,
        primaryDepartmentId: true,
        levelId: true,
        programmeId: true,
        avatarUrl: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Account is inactive or not found.', [], 401);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('JWT verification failed: %s', err.message);
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please log in again.', [], 401);
    }
    return errorResponse(res, 'Invalid authentication token.', [], 401);
  }
}

/**
 * Authorization Middleware Factory
 * Restricts access to users whose accessLevel meets or exceeds the required level.
 *
 * Level Hierarchy:
 *   L0_STUDENT < L1_REP < L2_DEPT_ADMIN < L3_FACULTY_ADMIN < L4_UNIVERSITY_ADMIN < L5_SUPER_ADMIN
 *
 * @param {string|string[]} requiredLevel - The minimum required access level(s)
 * @returns {Function} Express middleware
 */
const LEVEL_ORDER = {
  L0_STUDENT: 0,
  L1_REP: 1,
  L2_DEPT_ADMIN: 2,
  L3_FACULTY_ADMIN: 3,
  L4_UNIVERSITY_ADMIN: 4,
  L5_SUPER_ADMIN: 5,
};

function authorize(...requiredLevels) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated.', [], 401);
    }

    const userLevel = LEVEL_ORDER[req.user.accessLevel] ?? -1;
    const minRequired = Math.min(...requiredLevels.map((l) => LEVEL_ORDER[l] ?? 99));

    if (userLevel >= minRequired) {
      return next();
    }

    logger.warn(
      `Authorization denied: User ${req.user.email} (${req.user.accessLevel}) tried to access a route requiring ${requiredLevels.join(' or ')}.`
    );

    return errorResponse(
      res,
      'You do not have permission to perform this action.',
      [],
      403
    );
  };
}

/**
 * Self-or-admin middleware.
 * Allows the request only if the requesting user is the resource owner OR has sufficient privileges.
 * Expects req.params.userId to identify the target user.
 * @param {string} minAdminLevel - Minimum level that overrides ownership check
 */
function authorizeOwnerOrAdmin(minAdminLevel = 'L4_UNIVERSITY_ADMIN') {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated.', [], 401);
    }

    const isSelf = req.params.userId === req.user.id;
    const userLevel = LEVEL_ORDER[req.user.accessLevel] ?? -1;
    const adminLevel = LEVEL_ORDER[minAdminLevel] ?? 99;

    if (isSelf || userLevel >= adminLevel) {
      return next();
    }

    return errorResponse(res, 'Access denied.', [], 403);
  };
}

module.exports = { authenticate, authorize, authorizeOwnerOrAdmin, LEVEL_ORDER };
