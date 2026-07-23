const prisma = require('../config/db');
const logger = require('../config/logger');

/**
 * Audit Logging Middleware / Utility
 *
 * Records privileged actions in the audit_logs table.
 *
 * @param {object} params
 * @param {string} params.actorId    - UUID of the user performing the action
 * @param {string} params.action     - Action code (e.g. 'USER_REGISTERED', 'ANNOUNCEMENT_APPROVED')
 * @param {string} [params.targetTable] - The DB table being acted on
 * @param {string} [params.targetId]    - UUID of the record being acted on
 * @param {object} [params.metadata]    - Extra JSON context (diff values, before/after, etc.)
 * @param {string} [params.ipAddress]   - Requester IP address
 */
async function logAudit({ actorId, action, targetTable, targetId, metadata, ipAddress } = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        targetTable: targetTable || null,
        targetId: targetId || null,
        metadata: metadata || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    // Audit failures must never crash the main request flow.
    logger.error('Failed to write audit log: %s', err.message);
  }
}

/**
 * Activity logging middleware factory.
 * Records what a user did (lighter-weight than audit log, for user-facing activity feeds).
 *
 * @param {string} userId  - UUID of the acting user
 * @param {string} action  - Short action label
 * @param {string} details - Human-readable description
 */
async function logActivity(userId, action, details = '') {
  try {
    await prisma.activityLog.create({
      data: { userId, action, details },
    });
  } catch (err) {
    logger.error('Failed to write activity log: %s', err.message);
  }
}

module.exports = { logAudit, logActivity };
