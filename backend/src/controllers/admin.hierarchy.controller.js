const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

// Mendapatkan daftar semua user beserta atasannya
const getHierarchy = async (req, res) => {
  try {
    // Hanya admin dan peran yang relevan (internal user)
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          role: {
            in: ['CALON_WALI', 'WALI_AKTIF']
          }
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        phone: true,
        role: true,
        supervisors: {
          include: {
            supervisor: {
              select: {
                id: true,
                namaLengkap: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { namaLengkap: 'asc' }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menyimpan atasan untuk user (Bisa banyak)
const assignSupervisors = async (req, res) => {
  try {
    const { subordinateId, supervisorIds } = req.body;
    
    // Validasi
    if (!subordinateId || !Array.isArray(supervisorIds)) {
      return res.status(400).json({ message: 'Data tidak valid' });
    }

    // Pastikan tidak assign diri sendiri
    if (supervisorIds.includes(subordinateId)) {
      return res.status(400).json({ message: 'Tidak dapat menjadikan diri sendiri sebagai atasan' });
    }

    // Hapus hirarki lama di mana subordinateId ini sebagai bawahan
    await prisma.userHierarchy.deleteMany({
      where: { subordinateId }
    });

    // Tambah hirarki baru
    if (supervisorIds.length > 0) {
      const data = supervisorIds.map(supId => ({
        subordinateId,
        supervisorId: supId
      }));

      await prisma.userHierarchy.createMany({
        data
      });
    }

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'UserHierarchy',
      details: `Mengubah atasan untuk user ID ${subordinateId}: ${supervisorIds.join(', ')}`,
      req
    });

    res.status(200).json({ message: 'Berhasil menyimpan hirarki' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getHierarchy,
  assignSupervisors
};
