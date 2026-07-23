const announcementService = require('../services/announcementService');
const { successResponse } = require('../utils/response');

// POST /api/announcements
async function create(req, res, next) {
  try {
    const announcement = await announcementService.createAnnouncement(req.body, req.user);
    return successResponse(res, 'Announcement created successfully.', { announcement }, 201);
  } catch (err) { next(err); }
}

// GET /api/announcements — audience-filtered feed for current user
async function getMyFeed(req, res, next) {
  try {
    const { page, limit, search, categoryId, status } = req.query;
    const result = await announcementService.getMyAnnouncements(req.user, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      categoryId,
      status,
    });
    return successResponse(res, 'Announcements retrieved.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/all — all announcements for admins
async function listAll(req, res, next) {
  try {
    const { page, limit, search, categoryId, status, scope } = req.query;
    const result = await announcementService.listAllAnnouncements({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      categoryId,
      status,
      scope,
    });
    return successResponse(res, 'All announcements retrieved.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/:id
async function getById(req, res, next) {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.id, req.user);
    return successResponse(res, 'Announcement retrieved.', { announcement });
  } catch (err) { next(err); }
}

// PATCH /api/announcements/:id
async function update(req, res, next) {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, req.user);
    return successResponse(res, 'Announcement updated.', { announcement });
  } catch (err) { next(err); }
}

// PATCH /api/announcements/:announcementId/status
async function changeStatus(req, res, next) {
  try {
    const { status, rejectionReason } = req.body;
    const announcement = await announcementService.changeAnnouncementStatus(
      req.params.announcementId, status, rejectionReason, req.user
    );
    return successResponse(res, `Announcement status changed to '${status}'.`, { announcement });
  } catch (err) { next(err); }
}

// DELETE /api/announcements/:id
async function remove(req, res, next) {
  try {
    await announcementService.deleteAnnouncement(req.params.id, req.user);
    return successResponse(res, 'Announcement deleted successfully.');
  } catch (err) { next(err); }
}

// POST /api/announcements/:id/bookmark
async function bookmark(req, res, next) {
  try {
    const result = await announcementService.bookmarkAnnouncement(req.user.id, req.params.id);
    return successResponse(res, 'Announcement bookmarked.', result);
  } catch (err) { next(err); }
}

// DELETE /api/announcements/:id/bookmark
async function unbookmark(req, res, next) {
  try {
    const result = await announcementService.removeBookmark(req.user.id, req.params.id);
    return successResponse(res, 'Bookmark removed.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/bookmarks — get current user's bookmarks
async function getBookmarks(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await announcementService.getMyBookmarks(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return successResponse(res, 'Bookmarks retrieved.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/notifications
async function getNotifications(req, res, next) {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await announcementService.getMyNotifications(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === 'true',
    });
    return successResponse(res, 'Notifications retrieved.', result);
  } catch (err) { next(err); }
}

// PATCH /api/announcements/notifications/read
async function markRead(req, res, next) {
  try {
    const { notificationIds } = req.body;
    await announcementService.markNotificationsRead(req.user.id, notificationIds);
    return successResponse(res, 'Notifications marked as read.');
  } catch (err) { next(err); }
}

// POST /api/announcements/:id/react
async function react(req, res, next) {
  try {
    const { type } = req.body;
    const result = await announcementService.toggleReaction(req.params.id, req.user.id, type);
    return successResponse(res, result.added ? 'Reaction added.' : 'Reaction removed.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/:id/reactions
async function getReactions(req, res, next) {
  try {
    const result = await announcementService.getReactions(req.params.id, req.user.id);
    return successResponse(res, 'Reactions retrieved.', result);
  } catch (err) { next(err); }
}

// GET /api/announcements/:id/comments
async function listComments(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await announcementService.getComments(req.params.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    return successResponse(res, 'Comments retrieved.', result);
  } catch (err) { next(err); }
}

// POST /api/announcements/:id/comments
async function addComment(req, res, next) {
  try {
    const comment = await announcementService.createComment(req.params.id, req.user.id, req.body.content);
    return successResponse(res, 'Comment posted.', { comment }, 201);
  } catch (err) { next(err); }
}

// DELETE /api/announcements/:id/comments/:commentId
async function removeComment(req, res, next) {
  try {
    const { LEVEL_ORDER } = require('../middlewares/auth');
    const userLevel = LEVEL_ORDER[req.user.accessLevel] ?? 0;
    await announcementService.deleteComment(req.params.commentId, req.user.id, userLevel);
    return successResponse(res, 'Comment deleted.');
  } catch (err) { next(err); }
}

module.exports = {
  create, getMyFeed, listAll, getById, update, changeStatus,
  remove, bookmark, unbookmark, getBookmarks, getNotifications, markRead,
  react, getReactions, listComments, addComment, removeComment,
};
