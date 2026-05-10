const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === KATEGORI DOKUMEN ===
exports.getKategori = async (req, res) => {
  try {
    const categories = await prisma.dokumenKategori.findMany({
      include: { _count: { select: { dokumen: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createKategori = async (req, res) => {
  try {
    const { kode, nama, ikon } = req.body;
    const existing = await prisma.dokumenKategori.findUnique({ where: { kode } });
    if (existing) return res.status(400).json({ success: false, message: "Kode kategori sudah ada" });

    const kategori = await prisma.dokumenKategori.create({
      data: { kode, nama, ikon }
    });
    res.json({ success: true, data: kategori });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dokumenKategori.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Kategori dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === INFO DOKUMEN ===
exports.getDokumen = async (req, res) => {
  try {
    const dokumen = await prisma.infoDokumen.findMany({
      include: {
        kategori: true,
        markaz: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: dokumen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDokumen = async (req, res) => {
  try {
    const { kategoriId, markazId, judul, deskripsi, fileUrl, tipeFile, isPublik } = req.body;
    const dokumen = await prisma.infoDokumen.create({
      data: {
        kategoriId: parseInt(kategoriId),
        markazId: markazId ? parseInt(markazId) : null,
        judul,
        deskripsi,
        fileUrl,
        tipeFile: tipeFile || 'PDF',
        isPublik: isPublik !== undefined ? isPublik : true
      }
    });
    res.json({ success: true, data: dokumen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategoriId, markazId, judul, deskripsi, fileUrl, tipeFile, isPublik } = req.body;
    const dokumen = await prisma.infoDokumen.update({
      where: { id },
      data: {
        kategoriId: parseInt(kategoriId),
        markazId: markazId ? parseInt(markazId) : null,
        judul,
        deskripsi,
        fileUrl,
        tipeFile,
        isPublik
      }
    });
    res.json({ success: true, data: dokumen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.infoDokumen.delete({ where: { id } });
    res.json({ success: true, message: "Dokumen dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
