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

    const { tanggal, judul, tugas, warna, labels, status } = req.body;
    
    if (!tanggal || !tugas) {
      return res.status(400).json({ message: 'Tanggal dan Tugas harus diisi' });
    }

    const id = crypto.randomUUID();
    const tgl = new Date(tanggal);
    const stat = status || 'PENDING';
    const jdl = judul || null;
    const wrn = warna || null;
    const lbls = labels ? JSON.stringify(labels) : null;
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO CatatanAdmin (id, tanggal, judul, tugas, warna, labels, status, createdAt, updatedAt)
      VALUES (${id}, ${tgl}, ${jdl}, ${tugas}, ${wrn}, ${lbls}, ${stat}, ${now}, ${now})
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
    const { tanggal, judul, tugas, warna, labels, status } = req.body;
    const now = new Date();
    
    // Base SQL string building is tricky with raw parameters, we'll just use a direct approach
    // We update all fields assuming they are provided, or keep them if we use a targeted update.
    // To handle partial updates with $executeRaw properly without Prisma Client, we can just update what's given.
    // Or simpler: fetch existing first.
    const existingArr = await prisma.$queryRaw`SELECT * FROM CatatanAdmin WHERE id = ${id}`;
    const existing = existingArr[0];
    if (!existing) {
       return res.status(404).json({ message: 'Catatan tidak ditemukan' });
    }

    const newTanggal = tanggal ? new Date(tanggal) : existing.tanggal;
    const newJudul = judul !== undefined ? judul : existing.judul;
    const newTugas = tugas !== undefined ? tugas : existing.tugas;
    const newWarna = warna !== undefined ? warna : existing.warna;
    const newLabels = labels !== undefined ? (labels ? JSON.stringify(labels) : null) : existing.labels;
    const newStatus = status !== undefined ? status : existing.status;

    await prisma.$executeRaw`
       UPDATE CatatanAdmin 
       SET tanggal = ${newTanggal}, 
           judul = ${newJudul}, 
           tugas = ${newTugas}, 
           warna = ${newWarna}, 
           labels = ${newLabels}, 
           status = ${newStatus}, 
           updatedAt = ${now} 
       WHERE id = ${id}
    `;

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
