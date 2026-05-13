const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

// ==========================================
// SDM UNIT CONTROLLER
// ==========================================

const getUnits = async (req, res) => {
  try {
    const units = await prisma.sdmUnit.findMany({
      include: {
        posisi: {
          include: {
            pegawai: {
              select: { id: true, namaLengkap: true, fotoUrl: true }
            }
          }
        }
      }
    });

    // Build tree
    const unitMap = {};
    const rootUnits = [];

    units.forEach(unit => {
      unit.children = [];
      unitMap[unit.id] = unit;
    });

    units.forEach(unit => {
      if (unit.parentId && unitMap[unit.parentId]) {
        unitMap[unit.parentId].children.push(unit);
      } else {
        rootUnits.push(unit);
      }
    });

    res.status(200).json({ units: rootUnits, flatUnits: units });
  } catch (error) {
    console.error("Error getUnits:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUnit = async (req, res) => {
  try {
    const { nama, parentId } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama unit wajib diisi' });

    const newUnit = await prisma.sdmUnit.create({
      data: {
        nama,
        parentId: parentId || null
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'SdmUnit',
      entityId: newUnit.id,
      details: `Membuat unit baru: ${nama}`,
      req
    });

    res.status(201).json({ message: 'Unit berhasil dibuat', unit: newUnit });
  } catch (error) {
    console.error("Error createUnit:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, parentId } = req.body;

    // Cegah circular reference sederhana
    if (parentId === id) {
      return res.status(400).json({ message: 'Unit tidak bisa menjadi parent untuk dirinya sendiri' });
    }

    const updatedUnit = await prisma.sdmUnit.update({
      where: { id },
      data: {
        nama,
        parentId: parentId || null
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'SdmUnit',
      entityId: id,
      details: `Memperbarui unit: ${nama}`,
      req
    });

    res.status(200).json({ message: 'Unit berhasil diperbarui', unit: updatedUnit });
  } catch (error) {
    console.error("Error updateUnit:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah punya anak
    const childCount = await prisma.sdmUnit.count({ where: { parentId: id } });
    if (childCount > 0) {
      return res.status(400).json({ message: 'Tidak dapat menghapus unit yang masih memiliki sub-unit' });
    }

    const deleted = await prisma.sdmUnit.delete({ where: { id } });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'SdmUnit',
      entityId: id,
      details: `Menghapus unit: ${deleted.nama}`,
      req
    });

    res.status(200).json({ message: 'Unit berhasil dihapus' });
  } catch (error) {
    console.error("Error deleteUnit:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// SDM POSISI CONTROLLER
// ==========================================

const createPosisi = async (req, res) => {
  try {
    const { nama, isKepala, unitId, pegawaiId, peran, tanggungJawab, wewenang } = req.body;
    
    if (!nama || !unitId) return res.status(400).json({ message: 'Nama dan Unit wajib diisi' });

    // Jika isKepala = true, cek apakah unit ini sudah punya kepala
    if (isKepala) {
      const existingKepala = await prisma.sdmPosisi.findFirst({
        where: { unitId, isKepala: true }
      });
      if (existingKepala) {
        return res.status(400).json({ message: 'Unit ini sudah memiliki kepala. Silakan edit kepala yang ada.' });
      }
    }

    const newPosisi = await prisma.sdmPosisi.create({
      data: {
        nama,
        isKepala: isKepala || false,
        unitId,
        pegawaiId: pegawaiId || null,
        peran: peran || null,
        tanggungJawab: tanggungJawab || null,
        wewenang: wewenang || null
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'SdmPosisi',
      entityId: newPosisi.id,
      details: `Membuat posisi ${nama} di unit ${unitId}`,
      req
    });

    res.status(201).json({ message: 'Posisi berhasil dibuat', posisi: newPosisi });
  } catch (error) {
    console.error("Error createPosisi:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePosisi = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, isKepala, pegawaiId, peran, tanggungJawab, wewenang } = req.body;

    const posisi = await prisma.sdmPosisi.findUnique({ where: { id } });
    if (!posisi) return res.status(404).json({ message: 'Posisi tidak ditemukan' });

    // Jika diubah menjadi kepala, cek apakah sudah ada kepala lain di unit yang sama
    if (isKepala && !posisi.isKepala) {
      const existingKepala = await prisma.sdmPosisi.findFirst({
        where: { unitId: posisi.unitId, isKepala: true, id: { not: id } }
      });
      if (existingKepala) {
        return res.status(400).json({ message: 'Unit ini sudah memiliki kepala.' });
      }
    }

    const updatedPosisi = await prisma.sdmPosisi.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(isKepala !== undefined && { isKepala }),
        ...(pegawaiId !== undefined && { pegawaiId: pegawaiId || null }),
        ...(peran !== undefined && { peran: peran || null }),
        ...(tanggungJawab !== undefined && { tanggungJawab: tanggungJawab || null }),
        ...(wewenang !== undefined && { wewenang: wewenang || null })
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'SdmPosisi',
      entityId: id,
      details: `Memperbarui posisi ${nama}`,
      req
    });

    res.status(200).json({ message: 'Posisi berhasil diperbarui', posisi: updatedPosisi });
  } catch (error) {
    console.error("Error updatePosisi:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePosisi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const posisi = await prisma.sdmPosisi.delete({ where: { id } });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'SdmPosisi',
      entityId: id,
      details: `Menghapus posisi ${posisi.nama}`,
      req
    });

    res.status(200).json({ message: 'Posisi berhasil dihapus' });
  } catch (error) {
    console.error("Error deletePosisi:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  createPosisi,
  updatePosisi,
  deletePosisi
};
