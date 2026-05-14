const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

const getSdmUnits = async (req, res) => {
  try {
    const units = await prisma.sdmUnit.findMany({
      orderBy: { nama: 'asc' }
    });
    res.status(200).json(units);
  } catch (error) {
    console.error("Error getSdmUnits:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSaran = async (req, res) => {
  try {
    const { subjek, isiSaran, targetType, targetUnitId } = req.body;

    if (!subjek || !isiSaran || !targetType) {
      return res.status(400).json({ message: 'Subjek, Isi Saran, dan Target Tujuan harus diisi' });
    }

    if (targetType === 'KEPALA_UNIT' && !targetUnitId) {
      return res.status(400).json({ message: 'Unit tujuan harus dipilih' });
    }

    const saran = await prisma.saranOnline.create({
      data: {
        subjek,
        isiSaran,
        targetType,
        targetUnitId: targetType === 'KEPALA_UNIT' ? targetUnitId : null,
        pengirimId: req.user.userId,
        status: 'TERKIRIM'
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'SaranOnline',
      details: `Mengirim saran ke ${targetType}`,
      req
    });

    res.status(201).json({ message: 'Saran berhasil dikirim', saran });
  } catch (error) {
    console.error("Error createSaran:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSaranTerkirim = async (req, res) => {
  try {
    const saranTerkirim = await prisma.saranOnline.findMany({
      where: { pengirimId: req.user.userId },
      include: {
        targetUnit: { select: { nama: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(saranTerkirim);
  } catch (error) {
    console.error("Error getSaranTerkirim:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSaranMasuk = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isSuperAdmin = currentUser?.permissions?.includes('MANAJEMEN_ADMIN');

    let targetUnits = [];
    const myPegawai = await prisma.pegawai.findUnique({
      where: { userId: req.user.userId },
      include: {
        posisiOrganisasi: {
          where: { isKepala: true }
        }
      }
    });

    if (myPegawai && myPegawai.posisiOrganisasi && myPegawai.posisiOrganisasi.length > 0) {
      targetUnits = myPegawai.posisiOrganisasi.map(p => p.unitId);
    }

    let whereClause = {};

    if (isSuperAdmin) {
      whereClause.OR = [
        { targetType: 'SUPERADMIN' },
        { targetType: 'UMUM' }
      ];
      if (targetUnits.length > 0) {
        whereClause.OR.push({ targetType: 'KEPALA_UNIT', targetUnitId: { in: targetUnits } });
      }
    } else {
      if (targetUnits.length > 0) {
        whereClause = {
          targetType: 'KEPALA_UNIT',
          targetUnitId: { in: targetUnits }
        };
      } else {
        return res.status(200).json([]);
      }
    }

    const saranMasuk = await prisma.saranOnline.findMany({
      where: whereClause,
      include: {
        pengirim: { select: { namaLengkap: true, email: true } },
        targetUnit: { select: { nama: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(saranMasuk);
  } catch (error) {
    console.error("Error getSaranMasuk:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateStatusSaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const saran = await prisma.saranOnline.update({
      where: { id },
      data: { status }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'SaranOnline',
      details: `Mengubah status saran menjadi ${status}`,
      req
    });

    res.status(200).json({ message: 'Status berhasil diubah', saran });
  } catch (error) {
    console.error("Error updateStatusSaran:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getSdmUnits,
  createSaran,
  getSaranTerkirim,
  getSaranMasuk,
  updateStatusSaran
};
