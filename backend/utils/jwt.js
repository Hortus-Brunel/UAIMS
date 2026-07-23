const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`;
const REFRESH_EXPIRES_IN = '30d';

/**
 * Generate a signed access JWT token for a user.
 * @param {object} payload - User fields to embed in token
 * @returns {string} signed JWT
 */
function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate a signed refresh JWT token.
 * @param {object} payload - Minimal user identity fields
 * @returns {string} signed JWT
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

/**
 * Verify and decode an access JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws jwt error if invalid or expired
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Verify and decode a refresh JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

/**
 * Build the user payload to embed in the token.
 * @param {object} user - Prisma user object
 * @returns {object} token payload
 */
function buildTokenPayload(user) {
  return {
    id: user.id,
    email: user.email,
    matricule: user.matricule,
    accessLevel: user.accessLevel,
    primaryFacultyId: user.primaryFacultyId,
    primaryDepartmentId: user.primaryDepartmentId,
    levelId: user.levelId,
    programmeId: user.programmeId,
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPayload,
};
