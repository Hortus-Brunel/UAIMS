const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/overview', authorize('L3_FACULTY_ADMIN'), analyticsController.getOverview);
router.get('/audit-logs', authorize('L4_UNIVERSITY_ADMIN'), analyticsController.getAuditLogs);

module.exports = router;
