const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  announcementBodyValidator,
  updateStatusValidator,
  listAnnouncementsValidator,
} = require('../validators/announcementValidator');

// All announcement routes require authentication
router.use(authenticate);

// ─── Notifications (before /:id routes to avoid conflicts) ───────────────────
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/read', ctrl.markRead);

// ─── Bookmarks ────────────────────────────────────────────────────────────────
router.get('/bookmarks', ctrl.getBookmarks);

// ─── Admin: all announcements (L2+) ──────────────────────────────────────────
router.get('/all', authorize('L2_DEPT_ADMIN'), listAnnouncementsValidator, validate, ctrl.listAll);

// ─── Audience-filtered feed (all authenticated users) ────────────────────────
router.get('/', listAnnouncementsValidator, validate, ctrl.getMyFeed);

// ─── Create (L1+) ─────────────────────────────────────────────────────────────
router.post('/', authorize('L1_REP'), announcementBodyValidator, validate, ctrl.create);

// ─── Single announcement ──────────────────────────────────────────────────────
router.get('/:id', ctrl.getById);

// ─── Update (author or L2+) ───────────────────────────────────────────────────
router.patch('/:id', ctrl.update);

// ─── Status lifecycle (L2+ for approvals) ────────────────────────────────────
router.patch('/:announcementId/status', authorize('L2_DEPT_ADMIN'), updateStatusValidator, validate, ctrl.changeStatus);

// ─── Delete (author of draft/rejected, or L3+) ───────────────────────────────
router.delete('/:id', ctrl.remove);

// ─ Bookmarks ──────────────────────────────────────────────────────────────────────────────
router.post('/:id/bookmark', ctrl.bookmark);
router.delete('/:id/bookmark', ctrl.unbookmark);

// ─ Reactions ──────────────────────────────────────────────────────────────────────────────
router.post('/:id/react', ctrl.react);
router.get('/:id/reactions', ctrl.getReactions);

// ─ Comments ──────────────────────────────────────────────────────────────────────────────
router.get('/:id/comments', ctrl.listComments);
router.post('/:id/comments', ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.removeComment);

module.exports = router;
