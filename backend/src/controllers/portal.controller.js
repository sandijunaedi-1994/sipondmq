const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getChildren = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all children linked to this user via WaliSantri
    const waliRelations = await prisma.waliSantri.findMany({
      where: { userId },
      include: {
        santri: {
          include: {
            markaz: true,
          }
        }
      }
    });

    const children = waliRelations.map(rel => ({
      id: rel.santri.id,
      nis: rel.santri.nis,
      nama: rel.santri.nama,
      kelas: rel.santri.kelas,
      asrama: rel.santri.asrama,
      status: rel.santri.status,
      fotoUrl: rel.santri.fotoUrl,
      markaz: rel.santri.markaz ? rel.santri.markaz.nama : null,
      hubungan: rel.hubungan,
      isPrimary: rel.isPrimary,
    }));

    res.json({ success: true, children });
  } catch (error) {
    console.error("getChildren error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateHubunganWali = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { hubungan } = req.body;

    if (!['AYAH', 'IBU', 'WALI'].includes(hubungan)) {
      return res.status(400).json({ success: false, message: "Hubungan tidak valid" });
    }

    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.userId, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    await prisma.waliSantri.update({
      where: { userId_santriId: { userId: req.user.userId, santriId } },
      data: { hubungan }
    });

    res.json({ success: true, message: "Hubungan wali berhasil diperbarui", hubungan });
  } catch (error) {
    console.error("updateHubunganWali error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getFinance = async (req, res) => {
  try {
    const { santriId } = req.params;
    
    // Check access
    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.id, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    // Fetch tagihan
    const tagihans = await prisma.tagihan.findMany({
      where: { santriId },
      include: { jenis: true },
      orderBy: { jatuhTempo: 'asc' }
    });

    // Fetch uang saku
    const uangSaku = await prisma.uangSaku.findUnique({
      where: { santriId }
    });

    // Fetch mutasi
    const mutasi = await prisma.uangSakuMutasi.findMany({
      where: { santriId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      tagihan: tagihans,
      uangSaku: uangSaku || { saldo: 0, limitHarian: null },
      mutasi
    });
  } catch (error) {
    console.error("getFinance error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.setPocketMoneyLimit = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { limitHarian } = req.body;

    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.id, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    const uangSaku = await prisma.uangSaku.upsert({
      where: { santriId },
      update: { limitHarian: limitHarian ? parseFloat(limitHarian) : null },
      create: { 
        santriId, 
        saldo: 0, 
        limitHarian: limitHarian ? parseFloat(limitHarian) : null 
      }
    });

    res.json({ success: true, limitHarian: uangSaku.limitHarian });
  } catch (error) {
    console.error("setPocketMoneyLimit error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAcademic = async (req, res) => {
  try {
    const { santriId } = req.params;
    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.id, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    // Fetch Tahfidz
    const tahfidzTahapan = await prisma.tahfidzCapaianTahapan.findMany({
      where: { santriId },
      include: { tahapan: true },
      orderBy: { tahapan: { urutan: 'asc' } }
    });
    
    // Fetch Kehadiran (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const kehadiran = await prisma.kehadiran.findMany({
      where: { santriId, tanggal: { gte: thirtyDaysAgo } },
      include: { kategori: true }
    });

    // Fetch Pelanggaran
    const pelanggaran = await prisma.pelanggaran.findMany({
      where: { santriId },
      orderBy: { tanggal: 'desc' }
    });

    // Fetch Prestasi
    const prestasi = await prisma.prestasi.findMany({
      where: { santriId },
      orderBy: { tanggal: 'desc' }
    });

    // Fetch Kepengurusan
    const kepengurusan = await prisma.kepengurusan.findMany({
      where: { santriId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch Sertifikat
    const sertifikat = await prisma.sertifikat.findMany({
      where: { santriId },
      orderBy: { tanggal: 'desc' }
    });

    // Fetch Matan
    const matan = await prisma.matanCapaian.findMany({
      where: { santriId },
      include: { matan: true }
    });

    // Fetch Tahfidz Harian (last 5 days)
    const tahfidzHarian = await prisma.tahfidzHafalanHarian.findMany({
      where: { santriId },
      orderBy: { tanggal: 'desc' },
      take: 5
    });

    // Fetch Tahfidz Catatan
    const tahfidzCatatan = await prisma.tahfidzCatatanPengampu.findMany({
      where: { santriId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Fetch Surat Peringatan
    const suratPeringatan = await prisma.suratPeringatan.findMany({
      where: { santriId },
      orderBy: { tanggal: 'desc' }
    });

    res.json({
      success: true,
      tahfidz: tahfidzTahapan,
      tahfidzHarian,
      tahfidzCatatan,
      kehadiran,
      pelanggaran,
      suratPeringatan,
      prestasi,
      kepengurusan,
      sertifikat,
      matan
    });
  } catch (error) {
    console.error("getAcademic error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const { santriId } = req.params;
    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.id, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    const permissions = await prisma.perizinan.findMany({
      where: { santriId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, permissions });
  } catch (error) {
    console.error("getPermissions error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.requestPermission = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { jenis, alasan, tanggalMulai, tanggalKembali } = req.body;

    const hasAccess = await prisma.waliSantri.findUnique({
      where: { userId_santriId: { userId: req.user.userId, santriId } }
    });
    if (!hasAccess) return res.status(403).json({ success: false, message: "Akses ditolak" });

    const perizinan = await prisma.perizinan.create({
      data: {
        santriId,
        userId: req.user.id,
        jenis,
        alasan,
        tanggalMulai: new Date(tanggalMulai),
        tanggalKembali: new Date(tanggalKembali),
        status: "TINJAUAN"
      }
    });

    res.json({ success: true, perizinan });
  } catch (error) {
    console.error("requestPermission error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getInfo = async (req, res) => {
  try {
    const waliRelations = await prisma.waliSantri.findMany({
      where: { userId: req.user.userId },
      include: {
        santri: {
          select: { markazId: true }
        }
      }
    });

    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.userId },
      select: { markazId: true }
    });
    
    const markazIds = [...new Set([
      ...waliRelations.map(rel => rel.santri?.markazId).filter(id => id != null),
      ...registrations.map(reg => reg.markazId).filter(id => id != null)
    ])];

    const categories = await prisma.dokumenKategori.findMany({
      include: {
        dokumen: {
          where: { 
            isPublik: true,
            OR: [
              { markazId: null },
              { markazId: { in: markazIds } }
            ]
          }
        }
      }
    });



    const kalender = await prisma.kalenderKegiatan.findMany({
      where: {
        OR: [
          { markazId: null },
          { markazId: { in: markazIds } }
        ]
      },
      orderBy: { tanggal: 'asc' }
    });

    const targetFilter = req.user.role === 'CALON_WALI' ? 'PPDB' : 'SANTRI_AKTIF';

    const broadcasts = await prisma.broadcast.findMany({
      where: {
        AND: [
          {
            OR: [
              { markazId: null },
              { markazId: { in: markazIds } }
            ]
          },
          {
            OR: [
              { target: 'SEMUA' },
              { target: targetFilter }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, categories, kalender, broadcasts });
  } catch (error) {
    console.error("getInfo error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: String(error) });
  }
};
