const { body, query, param } = require('express-validator');

const VALID_SCOPES = ['UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'LEVEL', 'PROGRAMME', 'CLASS', 'CLUB', 'INDIVIDUAL'];
const VALID_STATUSES = ['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'archived', 'rejected'];

const announcementBodyValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters.'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required.')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters.'),

  body('categoryId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('Invalid category ID.'),

  body('isPinned')
    .optional()
    .isBoolean().withMessage('isPinned must be a boolean.'),

  body('isImportant')
    .optional()
    .isBoolean().withMessage('isImportant must be a boolean.'),

  body('publishAt')
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601().withMessage('publishAt must be a valid ISO 8601 date.')
    .custom((value) => {
      if (value && new Date(value) < new Date()) throw new Error('publishAt must be a future date.');
      return true;
    }),

  body('expiresAt')
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601().withMessage('expiresAt must be a valid ISO 8601 date.'),

  body('targets')
    .isArray({ min: 1 }).withMessage('At least one audience target is required.'),

  body('targets.*.scope')
    .notEmpty().withMessage('Each target must have a scope.')
    .isIn(VALID_SCOPES).withMessage(`Scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  body('targets.*.scopeId')
    .optional({ checkFalsy: true, nullable: true })
    .isUUID().withMessage('scopeId must be a valid UUID.'),

  // Attachments are optional and passed through to Prisma
  body('attachments')
    .optional({ checkFalsy: true, nullable: true }),
];

const updateStatusValidator = [
  param('announcementId').isUUID().withMessage('Invalid announcement ID.'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),
  body('rejectionReason')
    .optional()
    .isLength({ max: 500 }).withMessage('Rejection reason must not exceed 500 characters.'),
];

const listAnnouncementsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(VALID_STATUSES),
  query('categoryId').optional({ checkFalsy: true, nullable: true }).isUUID(),
  query('search').optional().isString().trim(),
  query('scope').optional().isIn(VALID_SCOPES),
];

module.exports = {
  announcementBodyValidator,
  updateStatusValidator,
  listAnnouncementsValidator,
};
