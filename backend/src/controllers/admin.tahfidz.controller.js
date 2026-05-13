const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Inisialisasi 7 Tahapan jika belum ada
const initTahapan = async () => {
  const count = await prisma.tahfidzTahapan.count();
  if (count === 0) {
    const tahapan = [
      "Tahsin & Tajwid",
      "Khotmul Qur'an",
      "Talqin Juz 29 & 30",
      "Dauroh Metode Menghafal",
      "Itqon",
      "Tasmi' Jalsah Wahidah",
      "Setoran Ziyadah"
    ];
    for (let i = 0; i < tahapan.length; i++) {
      await prisma.tahfidzTahapan.create({
        data: {
          urutan: i + 1,
          nama: tahapan[i],
          deskripsi: `Tahapan ${tahapan[i]}`
        }
      });
    }
  }
};

exports.getTahapanSantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    await initTahapan();

    const tahapanMaster = await prisma.tahfidzTahapan.findMany({
      orderBy: { urutan: 'asc' }
    });

    const capaian = await prisma.tahfidzCapaianTahapan.findMany({
      where: { santriId },
      include: { sertifikat: true }
    });

    // Merge master data dengan capaian
    const result = tahapanMaster.map(t => {
      const c = capaian.find(cap => cap.tahapanId === t.id);
      return {
        ...t,
        capaian: c || {
          status: 'BELUM',
          targetTanggal: null,
          selesaiTanggal: null,
          catatan: ''
        }
      };
    });

    res.json({ success: true, tahapan: result });
  } catch (error) {
    console.error("getTahapanSantri error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.updateTahapanSantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { tahapanId, targetTanggal, selesaiTanggal, status, catatan } = req.body;

    const capaian = await prisma.tahfidzCapaianTahapan.upsert({
      where: {
        santriId_tahapanId: {
          santriId,
          tahapanId: parseInt(tahapanId)
        }
      },
      update: {
        targetTanggal: targetTanggal ? new Date(targetTanggal) : null,
        selesaiTanggal: selesaiTanggal ? new Date(selesaiTanggal) : null,
        status,
        catatan
      },
      create: {
        santriId,
        tahapanId: parseInt(tahapanId),
        targetTanggal: targetTanggal ? new Date(targetTanggal) : null,
        selesaiTanggal: selesaiTanggal ? new Date(selesaiTanggal) : null,
        status,
        catatan
      }
    });

    res.json({ success: true, message: "Capaian tahapan berhasil diperbarui", capaian });
  } catch (error) {
    console.error("updateTahapanSantri error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.getHafalanHarian = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { bulan, tahun } = req.query; // optional filtering

    let whereClause = { santriId };

    if (bulan && tahun) {
      const start = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const end = new Date(parseInt(tahun), parseInt(bulan), 1);
      whereClause.tanggal = {
        gte: start,
        lt: end
      };
    }

    const hafalan = await prisma.tahfidzHafalanHarian.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' }
    });

    res.json({ success: true, hafalan });
  } catch (error) {
    console.error("getHafalanHarian error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.addHafalanHarian = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { tanggal, targetHal, capaianHal, totalJuz, keterangan } = req.body;

    // Optional: Validasi apakah santri sudah Itqon (bisa diaktifkan jika perlu)
    /*
    const itqonTahap = await prisma.tahfidzTahapan.findFirst({ where: { nama: 'Itqon' } });
    if (itqonTahap) {
      const itqonCapaian = await prisma.tahfidzCapaianTahapan.findUnique({
        where: { santriId_tahapanId: { santriId, tahapanId: itqonTahap.id } }
      });
      if (!itqonCapaian || itqonCapaian.status !== 'SELESAI') {
        return res.status(400).json({ success: false, message: "Santri belum menyelesaikan tahapan Itqon." });
      }
    }
    */

    const tgl = new Date(tanggal);

    const hafalan = await prisma.tahfidzHafalanHarian.upsert({
      where: {
        santriId_tanggal: {
          santriId,
          tanggal: tgl
        }
      },
      update: {
        targetHal: parseInt(targetHal),
        capaianHal: parseInt(capaianHal),
        totalJuz: totalJuz ? parseFloat(totalJuz) : null,
        keterangan
      },
      create: {
        santriId,
        tanggal: tgl,
        targetHal: parseInt(targetHal),
        capaianHal: parseInt(capaianHal),
        totalJuz: totalJuz ? parseFloat(totalJuz) : null,
        keterangan
      }
    });

    res.json({ success: true, message: "Hafalan harian berhasil disimpan", hafalan });
  } catch (error) {
    console.error("addHafalanHarian error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.getGlobalHafalan = async (req, res) => {
  try {
    const hafalan = await prisma.tahfidzHafalanHarian.findMany({
      take: 50,
      orderBy: { tanggal: 'desc' },
      include: {
        santri: {
          include: {
            registration: { select: { studentName: true } },
            kelasRef: { select: { nama: true } }
          }
        }
      }
    });
    res.json({ success: true, hafalan });
  } catch (error) {
    console.error("getGlobalHafalan error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.addGlobalHafalan = async (req, res) => {
  try {
    const { santriId, tanggal, targetHal, capaianHal, totalJuz, keterangan } = req.body;
    if (!santriId || !tanggal || !targetHal || !capaianHal) {
      return res.status(400).json({ success: false, message: "Lengkapi semua data yang wajib diisi" });
    }

    const tgl = new Date(tanggal);

    const hafalan = await prisma.tahfidzHafalanHarian.upsert({
      where: {
        santriId_tanggal: {
          santriId,
          tanggal: tgl
        }
      },
      update: {
        targetHal: parseInt(targetHal),
        capaianHal: parseInt(capaianHal),
        totalJuz: totalJuz ? parseFloat(totalJuz) : null,
        keterangan
      },
      create: {
        santriId,
        tanggal: tgl,
        targetHal: parseInt(targetHal),
        capaianHal: parseInt(capaianHal),
        totalJuz: totalJuz ? parseFloat(totalJuz) : null,
        keterangan
      }
    });

    res.json({ success: true, message: "Hafalan harian berhasil ditambahkan", hafalan });
  } catch (error) {
    console.error("addGlobalHafalan error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.updateGlobalHafalan = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetHal, capaianHal, totalJuz, keterangan, tanggal } = req.body;

    const hafalan = await prisma.tahfidzHafalanHarian.update({
      where: { id },
      data: {
        targetHal: parseInt(targetHal),
        capaianHal: parseInt(capaianHal),
        totalJuz: totalJuz ? parseFloat(totalJuz) : null,
        keterangan,
        tanggal: tanggal ? new Date(tanggal) : undefined
      }
    });

    res.json({ success: true, message: "Hafalan harian berhasil diperbarui", hafalan });
  } catch (error) {
    console.error("updateGlobalHafalan error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.deleteGlobalHafalan = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tahfidzHafalanHarian.delete({
      where: { id }
    });
    res.json({ success: true, message: "Hafalan harian berhasil dihapus" });
  } catch (error) {
    console.error("deleteGlobalHafalan error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.getSertifikatTahfidz = async (req, res) => {
  try {
    const { santriId } = req.params;
    const sertifikat = await prisma.sertifikat.findMany({
      where: { 
        santriId,
        tipe: 'TAHFIDZ'
      },
      include: {
        tahfidzCapaian: {
          include: { tahapan: true }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    res.json({ success: true, sertifikat });
  } catch (error) {
    console.error("getSertifikatTahfidz error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// Assuming multer is configured in routes
exports.uploadSertifikatTahfidz = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { judul, penerbit, tanggal, tahfidzCapaianId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File sertifikat wajib diupload" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const sertifikat = await prisma.sertifikat.create({
      data: {
        santriId,
        tipe: 'TAHFIDZ',
        judul,
        penerbit: penerbit || "Pesantren My MQ",
        tanggal: new Date(tanggal),
        fileUrl,
        tahfidzCapaianId: tahfidzCapaianId ? tahfidzCapaianId : null
      }
    });

    res.json({ success: true, message: "Sertifikat berhasil diupload", sertifikat });
  } catch (error) {
    console.error("uploadSertifikatTahfidz error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.deleteSertifikatTahfidz = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sertifikat.delete({ where: { id } });
    res.json({ success: true, message: "Sertifikat berhasil dihapus" });
  } catch (error) {
    console.error("deleteSertifikatTahfidz error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
