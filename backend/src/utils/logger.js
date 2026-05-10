const prisma = require('../lib/prisma');

/**
 * Catat aktivitas pengguna ke dalam ActivityLog
 * @param {Object} params
 * @param {string} params.userId - ID User yang melakukan aktivitas
 * @param {string} params.action - Aksi yang dilakukan (contoh: 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} params.entity - Entitas/Tabel yang dimodifikasi (contoh: 'Santri', 'AdminGroup')
 * @param {string} [params.entityId] - ID spesifik entitas jika ada
 * @param {Object|string} [params.details] - Data payload / detail perubahan
 * @param {Object} [params.req] - Object Express request untuk mendapatkan IP dan User-Agent
 */
const logActivity = async ({ userId, action, entity, entityId = null, details = null, req = null }) => {
  try {
    let ipAddress = null;
    let userAgent = null;
    
    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress);
      userAgent = req.headers['user-agent'];
    }

    const detailsStr = details ? (typeof details === 'object' ? JSON.stringify(details) : details) : null;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: detailsStr,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
};

module.exports = { logActivity };
