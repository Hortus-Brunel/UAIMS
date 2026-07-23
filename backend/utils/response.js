/**
 * Standard API response helpers.
 * All endpoints MUST use these to enforce consistent response shape:
 *   Success: { success: true, message: "...", data: {} }
 *   Failure: { success: false, message: "...", errors: [] }
 */

/**
 * Send a 200 OK success response.
 * @param {object} res - Express response object
 * @param {string} message - Human-readable success message
 * @param {object} data - Payload to return
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {Array}  errors - Array of error details (optional)
 * @param {number} statusCode - HTTP status code (default: 400)
 */
function errorResponse(res, message, errors = [], statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { successResponse, errorResponse };
