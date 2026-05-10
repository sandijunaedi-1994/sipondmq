const prisma = require('../lib/prisma');

const getKalender = async (req, res) => {
  try {
    const events = await prisma.kalenderKegiatan.findMany({
      include: { markaz: true },
      orderBy: { tanggal: 'asc' }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error getKalender:", error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

const createKalender = async (req, res) => {
  try {
    const { tanggal, tanggalSelesai, judul, deskripsi, tipe, isLibur, markazId } = req.body;
    
    if (tanggalSelesai) {
      const start = new Date(tanggal);
      const end = new Date(tanggalSelesai);
      if (end < start) return res.status(400).json({ message: 'Tanggal selesai tidak valid' });
      
      const eventsToCreate = [];
      let current = new Date(start);
      while (current <= end) {
        eventsToCreate.push({
          markazId: markazId ? parseInt(markazId) : null,
          tanggal: new Date(current),
          judul,
          deskripsi: deskripsi || null,
          tipe: tipe || 'LAINNYA',
          isLibur: isLibur || false
        });
        current.setDate(current.getDate() + 1);
      }
      
      await prisma.kalenderKegiatan.createMany({ data: eventsToCreate });
      res.status(201).json({ message: 'Multiple events created' });
    } else {
      const event = await prisma.kalenderKegiatan.create({
        data: {
          markazId: markazId ? parseInt(markazId) : null,
          tanggal: new Date(tanggal),
          judul,
          deskripsi: deskripsi || null,
          tipe: tipe || 'LAINNYA',
          isLibur: isLibur || false
        }
      });
      res.status(201).json(event);
    }
  } catch (error) {
    console.error("Error createKalender:", error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

const updateKalender = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, judul, deskripsi, tipe, isLibur, markazId } = req.body;

    const data = {};
    if (markazId !== undefined) data.markazId = markazId ? parseInt(markazId) : null;
    if (tanggal) data.tanggal = new Date(tanggal);
    if (judul !== undefined) data.judul = judul;
    if (deskripsi !== undefined) data.deskripsi = deskripsi;
    if (tipe) data.tipe = tipe;
    if (isLibur !== undefined) data.isLibur = isLibur;

    const event = await prisma.kalenderKegiatan.update({
      where: { id },
      data
    });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error updateKalender:", error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

const updateKalenderBatch = async (req, res) => {
  try {
    const { ids, tanggal, tanggalSelesai, judul, deskripsi, tipe, isLibur, markazId } = req.body;
    
    // Hapus agenda-agenda lama yang terkait
    if (ids && ids.length > 0) {
      await prisma.kalenderKegiatan.deleteMany({
        where: { id: { in: ids } }
      });
    }

    // Buat ulang sesuai rentang tanggal yang baru (sama dengan logika create)
    if (tanggalSelesai) {
      const start = new Date(tanggal);
      const end = new Date(tanggalSelesai);
      if (end < start) return res.status(400).json({ message: 'Tanggal selesai tidak valid' });
      
      const eventsToCreate = [];
      let current = new Date(start);
      while (current <= end) {
        eventsToCreate.push({
          markazId: markazId ? parseInt(markazId) : null,
          tanggal: new Date(current),
          judul,
          deskripsi: deskripsi || null,
          tipe: tipe || 'LAINNYA',
          isLibur: isLibur || false
        });
        current.setDate(current.getDate() + 1);
      }
      
      await prisma.kalenderKegiatan.createMany({ data: eventsToCreate });
      res.status(200).json({ message: 'Multiple events updated' });
    } else {
      const event = await prisma.kalenderKegiatan.create({
        data: {
          markazId: markazId ? parseInt(markazId) : null,
          tanggal: new Date(tanggal),
          judul,
          deskripsi: deskripsi || null,
          tipe: tipe || 'LAINNYA',
          isLibur: isLibur || false
        }
      });
      res.status(200).json(event);
    }
  } catch (error) {
    console.error("Error updateKalenderBatch:", error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

const deleteKalender = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kalenderKegiatan.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    console.error("Error deleteKalender:", error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

module.exports = {
  getKalender,
  createKalender,
  updateKalender,
  updateKalenderBatch,
  deleteKalender
};
