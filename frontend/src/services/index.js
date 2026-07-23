import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
};

export const userService = {
  getMe: () => apiClient.get('/users/me'),
  listUsers: (params) => apiClient.get('/users', { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (id, data) => apiClient.patch(`/users/${id}`, data),
  toggleStatus: (id) => apiClient.patch(`/users/${id}/toggle-status`),
  changeAccessLevel: (id, accessLevel) => apiClient.patch(`/users/${id}/access-level`, { accessLevel }),
  addClassMembership: (id, data) => apiClient.post(`/users/${id}/classes`, data),
  removeClassMembership: (userId, classId) => apiClient.delete(`/users/${userId}/classes/${classId}`),
  addClubMembership: (id, data) => apiClient.post(`/users/${id}/clubs`, data),
};

export const announcementService = {
  getFeed: (params) => apiClient.get('/announcements', { params }),
  getAll: (params) => apiClient.get('/announcements/all', { params }),
  getById: (id) => apiClient.get(`/announcements/${id}`),
  create: (data) => apiClient.post('/announcements', data),
  update: (id, data) => apiClient.patch(`/announcements/${id}`, data),
  changeStatus: (id, data) => apiClient.patch(`/announcements/${id}/status`, data),
  delete: (id) => apiClient.delete(`/announcements/${id}`),
  bookmark: (id) => apiClient.post(`/announcements/${id}/bookmark`),
  unbookmark: (id) => apiClient.delete(`/announcements/${id}/bookmark`),
  getBookmarks: (params) => apiClient.get('/announcements/bookmarks', { params }),
  getNotifications: (params) => apiClient.get('/announcements/notifications', { params }),
  markNotificationsRead: (ids) => apiClient.patch('/announcements/notifications/read', { notificationIds: ids }),
  // Reactions
  react: (id, type) => apiClient.post(`/announcements/${id}/react`, { type }),
  getReactions: (id) => apiClient.get(`/announcements/${id}/reactions`),
  // Comments
  getComments: (id, params) => apiClient.get(`/announcements/${id}/comments`, { params }),
  addComment: (id, content) => apiClient.post(`/announcements/${id}/comments`, { content }),
  deleteComment: (id, commentId) => apiClient.delete(`/announcements/${id}/comments/${commentId}`),
};

export const organizationService = {
  getFaculties: () => apiClient.get('/organization/faculties'),
  getDepartments: (facultyId) => apiClient.get(`/organization/faculties/${facultyId}/departments`),
  getAllDepartments: () => apiClient.get('/organization/departments'),
  getClasses: (departmentId) => apiClient.get(`/organization/departments/${departmentId}/classes`),
  getAllClasses: () => apiClient.get('/organization/classes'),
  getProgrammes: (departmentId) => apiClient.get(`/organization/departments/${departmentId}/programmes`),
  getAllProgrammes: () => apiClient.get('/organization/programmes'),
  getAcademicLevels: () => apiClient.get('/organization/academic-levels'),
  getClubs: () => apiClient.get('/organization/clubs'),
  getCategories: () => apiClient.get('/organization/categories'),
  createCategory: (data) => apiClient.post('/organization/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/organization/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/organization/categories/${id}`),
};

export const analyticsService = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getAuditLogs: (params) => apiClient.get('/analytics/audit-logs', { params }),
};

export const uploadService = {
  uploadFile: (formData) => apiClient.post('/upload', formData),
};
