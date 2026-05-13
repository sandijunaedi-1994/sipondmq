const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// =======================
// CRUD HALAQOH
// =======================

exports.getHalaqoh = async (req, res) => {
  try {
    const halaqoh = await prisma.halaqoh.findMany({
      include: {
        muhaffidz: { select: { namaLengkap: true } },
        markaz: { select: { nama: true, kode: true } },
        _count: { select: { santri: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, halaqoh });
  } catch (error) {
    console.error("getHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.getMyHalaqoh = async (req, res) => {
  try {
    const userId = req.user.id;
    const pegawai = await prisma.pegawai.findUnique({ where: { userId } });
    if (!pegawai) return res.status(404).json({ success: false, message: "Data pegawai tidak ditemukan" });

    const halaqoh = await prisma.halaqoh.findMany({
      where: { muhaffidzId: pegawai.id },
      include: {
        santri: {
          include: {
            registration: { select: { studentName: true, program: true, gender: true } }
          }
        }
      }
    });
    res.json({ success: true, halaqoh });
  } catch (error) {
    console.error("getMyHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.createHalaqoh = async (req, res) => {
  try {
    const { nama, muhaffidzId, markazId, aktif } = req.body;
    const halaqoh = await prisma.halaqoh.create({
      data: {
        nama,
        muhaffidzId: muhaffidzId || null,
        markazId: markazId ? parseInt(markazId) : null,
        aktif: aktif !== undefined ? aktif : true
      }
    });
    res.json({ success: true, message: "Halaqoh berhasil ditambahkan", halaqoh });
  } catch (error) {
    console.error("createHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.updateHalaqoh = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, muhaffidzId, markazId, aktif } = req.body;
    const halaqoh = await prisma.halaqoh.update({
      where: { id: parseInt(id) },
      data: {
        nama,
        muhaffidzId: muhaffidzId || null,
        markazId: markazId ? parseInt(markazId) : null,
        aktif: aktif !== undefined ? aktif : true
      }
    });
    res.json({ success: true, message: "Halaqoh berhasil diperbarui", halaqoh });
  } catch (error) {
    console.error("updateHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.deleteHalaqoh = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are still santri in this halaqoh
    const h = await prisma.halaqoh.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { santri: true } } }
    });

    if (h && h._count.santri > 0) {
      return res.status(400).json({ success: false, message: "Tidak dapat menghapus halaqoh karena masih ada santri di dalamnya." });
    }

    await prisma.halaqoh.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Halaqoh berhasil dihapus" });
  } catch (error) {
    console.error("deleteHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// =======================
// SANTRI HALAQOH
// =======================

exports.getSantriHalaqoh = async (req, res) => {
  try {
    const { halaqohId } = req.params;
    const santri = await prisma.santri.findMany({
      where: { halaqohId: parseInt(halaqohId) },
      include: {
        registration: { select: { studentName: true, program: true } }
      }
    });
    res.json({ success: true, santri });
  } catch (error) {
    console.error("getSantriHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.assignSantriHalaqoh = async (req, res) => {
  try {
    const { halaqohId } = req.params;
    const { santriIds } = req.body; // array of santri IDs

    await prisma.santri.updateMany({
      where: { id: { in: santriIds } },
      data: { halaqohId: parseInt(halaqohId) }
    });

    res.json({ success: true, message: "Santri berhasil dimasukkan ke halaqoh" });
  } catch (error) {
    console.error("assignSantriHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.removeSantriHalaqoh = async (req, res) => {
  try {
    const { santriId } = req.params;
    await prisma.santri.update({
      where: { id: santriId },
      data: { halaqohId: null }
    });
    res.json({ success: true, message: "Santri dikeluarkan dari halaqoh" });
  } catch (error) {
    console.error("removeSantriHalaqoh error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// =======================
// ABSENSI HALAQOH
// =======================

exports.inputAbsensiHalaqoh = async (req, res) => {
  try {
    const { halaqohId } = req.params;
    const { tanggal, absensiSantri, muhaffidzStatus, muhaffidzKeterangan, kategoriKehadiranId } = req.body;
    
    // absensiSantri: [{ santriId: '...', status: 'HADIR/IZIN/SAKIT/ALFA', keterangan: '...' }]
    
    const tgl = new Date(tanggal);

    await prisma.$transaction(async (tx) => {
      // 1. Absen Muhaffidz
      const halaqoh = await tx.halaqoh.findUnique({ where: { id: parseInt(halaqohId) } });
      if (halaqoh && halaqoh.muhaffidzId) {
        // Cek apakah sudah absen di hari itu
        const existingMuhaffidzAbsen = await tx.kehadiranMuhaffidz.findFirst({
          where: {
            halaqohId: parseInt(halaqohId),
            pegawaiId: halaqoh.muhaffidzId,
            tanggal: tgl
          }
        });

        if (existingMuhaffidzAbsen) {
          await tx.kehadiranMuhaffidz.update({
            where: { id: existingMuhaffidzAbsen.id },
            data: { status: muhaffidzStatus, keterangan: muhaffidzKeterangan }
          });
        } else {
          await tx.kehadiranMuhaffidz.create({
            data: {
              halaqohId: parseInt(halaqohId),
              pegawaiId: halaqoh.muhaffidzId,
              tanggal: tgl,
              status: muhaffidzStatus,
              keterangan: muhaffidzKeterangan
            }
          });
        }
      }

      // 2. Absen Santri
      if (!kategoriKehadiranId) {
        throw new Error("Kategori kehadiran harus diisi (misal: kategori Tahfidz)");
      }

      for (const absen of absensiSantri) {
        // Cek apakah sudah absen
        const existingAbsen = await tx.kehadiran.findFirst({
          where: {
            santriId: absen.santriId,
            tanggal: tgl,
            kategoriId: parseInt(kategoriKehadiranId)
          }
        });

        if (existingAbsen) {
          await tx.kehadiran.update({
            where: { id: existingAbsen.id },
            data: { status: absen.status, keterangan: absen.keterangan }
          });
        } else {
          await tx.kehadiran.create({
            data: {
              santriId: absen.santriId,
              tanggal: tgl,
              kategoriId: parseInt(kategoriKehadiranId),
              status: absen.status,
              keterangan: absen.keterangan,
              sesi: "Halaqoh Tahfidz"
            }
          });
        }
      }
    });

    res.json({ success: true, message: "Absensi halaqoh berhasil disimpan" });
  } catch (error) {
    console.error("inputAbsensiHalaqoh error:", error);
    res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan server" });
  }
};
