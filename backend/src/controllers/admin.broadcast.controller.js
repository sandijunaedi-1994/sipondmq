const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await prisma.broadcast.findMany({
      include: {
        markaz: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: broadcasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBroadcast = async (req, res) => {
  try {
    const { judul, pesan, tipe, target, markazId } = req.body;
    const broadcast = await prisma.broadcast.create({
      data: {
        judul,
        pesan,
        tipe: tipe || 'UMUM',
        target: target || 'SEMUA',
        markazId: markazId ? parseInt(markazId) : null
      }
    });
    res.json({ success: true, data: broadcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, pesan, tipe, target, markazId } = req.body;
    const broadcast = await prisma.broadcast.update({
      where: { id },
      data: {
        judul,
        pesan,
        tipe,
        target,
        markazId: markazId ? parseInt(markazId) : null
      }
    });
    res.json({ success: true, data: broadcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.broadcast.delete({ where: { id } });
    res.json({ success: true, message: "Broadcast dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
