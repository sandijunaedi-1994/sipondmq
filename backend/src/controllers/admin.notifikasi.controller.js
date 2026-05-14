const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

// Mendapatkan notifikasi milik admin saat ini
const getNotifikasi = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifikasi = await prisma.notifikasi.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Batasi 50 notifikasi terbaru
    });

    res.json(notifikasi);
  } catch (error) {
    console.error("Error getNotifikasi:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menandai satu notifikasi telah dibaca
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notifikasi = await prisma.notifikasi.findUnique({
      where: { id }
    });

    if (!notifikasi) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    if (notifikasi.userId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const updated = await prisma.notifikasi.update({
      where: { id },
      data: { dibaca: true }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menandai semua notifikasi telah dibaca
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.notifikasi.updateMany({
      where: { userId, dibaca: false },
      data: { dibaca: true }
    });

    res.json({ success: true, message: 'Semua notifikasi telah ditandai dibaca' });
  } catch (error) {
    console.error("Error markAllAsRead:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getNotifikasi,
  markAsRead,
  markAllAsRead
};
