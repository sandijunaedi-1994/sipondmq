const prisma = require('../lib/prisma');

const getMyChildHealthRecords = async (req, res) => {
  try {
    const { santriId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const waliSantri = await prisma.waliSantri.findUnique({
      where: {
        userId_santriId: { userId, santriId }
      }
    });

    if (!waliSantri) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke data santri ini' });
    }

    const records = await prisma.healthRecord.findMany({
      where: { santriId },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getMyChildHealthRecords
};
