const prisma = require('../lib/prisma');

const getCatatan = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.permissions?.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    // Gunakan raw query untuk menghindari masalah Prisma Client belum di-generate di cPanel
    const catatan = await prisma.$queryRaw`SELECT * FROM CatatanAdmin ORDER BY tanggal DESC`;
    res.status(200).json(catatan);
  } catch (error) {
    console.error("Error getCatatan:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const crypto = require('crypto');

const createCatatan = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.permissions?.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const { tanggal, tugas, status } = req.body;
    
    if (!tanggal || !tugas) {
      return res.status(400).json({ message: 'Tanggal dan Tugas harus diisi' });
    }

    const id = crypto.randomUUID();
    const tgl = new Date(tanggal);
    const stat = status || 'PENDING';
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO CatatanAdmin (id, tanggal, tugas, status, createdAt, updatedAt)
      VALUES (${id}, ${tgl}, ${tugas}, ${stat}, ${now}, ${now})
    `;
    
    const created = await prisma.$queryRaw`SELECT * FROM CatatanAdmin WHERE id = ${id}`;
    res.status(201).json(created[0] || {});
  } catch (error) {
    console.error("Error createCatatan:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update catatan
const updateCatatan = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.permissions?.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const { id } = req.params;
    const { tanggal, tugas, status } = req.body;
    const now = new Date();

    if (tanggal && tugas && status) {
       await prisma.$executeRaw`UPDATE CatatanAdmin SET tanggal = ${new Date(tanggal)}, tugas = ${tugas}, status = ${status}, updatedAt = ${now} WHERE id = ${id}`;
    } else if (status) {
       await prisma.$executeRaw`UPDATE CatatanAdmin SET status = ${status}, updatedAt = ${now} WHERE id = ${id}`;
    } else {
       // fallback for others if needed
       if (tanggal) await prisma.$executeRaw`UPDATE CatatanAdmin SET tanggal = ${new Date(tanggal)}, updatedAt = ${now} WHERE id = ${id}`;
       if (tugas) await prisma.$executeRaw`UPDATE CatatanAdmin SET tugas = ${tugas}, updatedAt = ${now} WHERE id = ${id}`;
    }

    const updated = await prisma.$queryRaw`SELECT * FROM CatatanAdmin WHERE id = ${id}`;
    res.status(200).json(updated[0] || {});
  } catch (error) {
    console.error("Error updateCatatan:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete catatan
const deleteCatatan = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.permissions?.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const { id } = req.params;
    await prisma.$executeRaw`DELETE FROM CatatanAdmin WHERE id = ${id}`;
    res.status(200).json({ message: 'Catatan berhasil dihapus' });
  } catch (error) {
    console.error("Error deleteCatatan:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCatatan,
  createCatatan,
  updateCatatan,
  deleteCatatan
};
