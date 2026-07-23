const prisma = require('../config/db');
const { successResponse } = require('../utils/response');

// GET /api/analytics/overview — System-wide stats (L3+)
async function getOverview(req, res, next) {
  try {
    const [totalUsers, totalAnnouncements, pendingApproval, publishedToday] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.announcement.count(),
      prisma.announcement.count({ where: { status: 'pending_approval' } }),
      prisma.announcement.count({
        where: {
          status: 'published',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    const byAccessLevel = await prisma.user.groupBy({
      by: ['accessLevel'],
      _count: { id: true },
    });

    const byStatus = await prisma.announcement.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return successResponse(res, 'Analytics retrieved.', {
      totalUsers,
      totalAnnouncements,
      pendingApproval,
      publishedToday,
      usersByLevel: byAccessLevel.map((g) => ({ level: g.accessLevel, count: g._count.id })),
      announcementsByStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
    });
  } catch (err) { next(err); }
}

// GET /api/analytics/audit-logs — Audit trail (L4+)
async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, action } = req.query;
    const skip = ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20);

    const where = action ? { action: { contains: action, mode: 'insensitive' } } : {};
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit) || 20,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(res, 'Audit logs retrieved.', {
      logs,
      pagination: { total, page: parseInt(page) || 1, limit: parseInt(limit) || 20, totalPages: Math.ceil(total / (parseInt(limit) || 20)) },
    });
  } catch (err) { next(err); }
}

module.exports = { getOverview, getAuditLogs };
