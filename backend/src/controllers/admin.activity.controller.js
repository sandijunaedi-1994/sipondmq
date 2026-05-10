const prisma = require('../lib/prisma');

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, filterUserId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { permissions: true }
    });

    const isSuperAdmin = currentUser?.permissions && currentUser.permissions.includes('MANAJEMEN_ADMIN');

    let whereClause = {};

    if (!isSuperAdmin) {
      // Normal admins can only see their own logs
      whereClause.userId = req.user.userId;
    } else if (filterUserId) {
      // Superadmin can filter by a specific user
      whereClause.userId = filterUserId === 'me' ? req.user.userId : filterUserId;
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { namaLengkap: true, email: true } }
      }
    });

    const totalLogs = await prisma.activityLog.count({ where: whereClause });

    res.status(200).json({
      logs,
      pagination: {
        total: totalLogs,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(totalLogs / take)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getActivityLogs };
