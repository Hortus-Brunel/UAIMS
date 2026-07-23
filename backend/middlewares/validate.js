const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to check express-validator results.
 * If validation fails, returns 422 with the list of errors.
 * Must be used AFTER the validator array in the route definition.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      'Validation failed. Please check your input.',
      errors.array().map((e) => ({ field: e.path, message: e.msg })),
      422
    );
  }
  next();
}

module.exports = validate;
