const prisma = require('../lib/prisma');

// =======================
// KELAS
// =======================
exports.getKelas = async (req, res) => {
  try {
    const { markazId } = req.query;
    let where = {};
    if (markazId && markazId !== 'SEMUA') {
      where.markazId = parseInt(markazId);
    }

    const kelas = await prisma.kelas.findMany({
      where,
      include: {
        markaz: { select: { nama: true, kode: true } },
        waliKelas: { select: { namaLengkap: true, nip: true } },
        _count: { select: { santri: { where: { status: 'AKTIF' } } } }
      },
      orderBy: [{ markazId: 'asc' }, { nama: 'asc' }]
    });

    res.status(200).json({ kelas });
  } catch (error) {
    console.error('Error getKelas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createKelas = async (req, res) => {
  try {
    const { markazId, nama, waliKelasId, tahunAjaran, aktif } = req.body;
    if (!markazId || !nama || !tahunAjaran) {
      return res.status(400).json({ message: 'Markaz, Nama Kelas, dan Tahun Ajaran wajib diisi' });
    }

    const newKelas = await prisma.kelas.create({
      data: {
        markazId: parseInt(markazId),
        nama,
        waliKelasId: waliKelasId ? parseInt(waliKelasId) : null,
        tahunAjaran,
        aktif: aktif !== undefined ? aktif : true
      }
    });

    res.status(201).json({ message: 'Kelas berhasil dibuat', kelas: newKelas });
  } catch (error) {
    console.error('Error createKelas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { markazId, nama, waliKelasId, tahunAjaran, aktif } = req.body;

    const updateKelas = await prisma.kelas.update({
      where: { id: parseInt(id) },
      data: {
        markazId: markazId ? parseInt(markazId) : undefined,
        nama,
        waliKelasId: waliKelasId === "" ? null : (waliKelasId ? parseInt(waliKelasId) : undefined),
        tahunAjaran,
        aktif
      }
    });

    res.status(200).json({ message: 'Kelas berhasil diperbarui', kelas: updateKelas });
  } catch (error) {
    console.error('Error updateKelas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah ada santri di kelas ini
    const countSantri = await prisma.santri.count({
      where: { kelasId: parseInt(id) }
    });

    if (countSantri > 0) {
      return res.status(400).json({ message: 'Tidak dapat menghapus kelas karena masih ada santri yang terdaftar' });
    }

    await prisma.kelas.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteKelas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// ASRAMA
// =======================
exports.getAsrama = async (req, res) => {
  try {
    const { markazId } = req.query;
    let where = {};
    if (markazId && markazId !== 'SEMUA') {
      where.markazId = parseInt(markazId);
    }

    const asrama = await prisma.asrama.findMany({
      where,
      include: {
        markaz: { select: { nama: true, kode: true } },
        musyrif: { select: { namaLengkap: true, nip: true } },
        _count: { select: { santri: { where: { status: 'AKTIF' } } } }
      },
      orderBy: [{ markazId: 'asc' }, { nama: 'asc' }]
    });

    res.status(200).json({ asrama });
  } catch (error) {
    console.error('Error getAsrama:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createAsrama = async (req, res) => {
  try {
    const { markazId, nama, musyrifId, kapasitas, aktif } = req.body;
    if (!markazId || !nama) {
      return res.status(400).json({ message: 'Markaz dan Nama Asrama wajib diisi' });
    }

    const newAsrama = await prisma.asrama.create({
      data: {
        markazId: parseInt(markazId),
        nama,
        musyrifId: musyrifId ? parseInt(musyrifId) : null,
        kapasitas: kapasitas ? parseInt(kapasitas) : null,
        aktif: aktif !== undefined ? aktif : true
      }
    });

    res.status(201).json({ message: 'Asrama berhasil dibuat', asrama: newAsrama });
  } catch (error) {
    console.error('Error createAsrama:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAsrama = async (req, res) => {
  try {
    const { id } = req.params;
    const { markazId, nama, musyrifId, kapasitas, aktif } = req.body;

    const updateAsrama = await prisma.asrama.update({
      where: { id: parseInt(id) },
      data: {
        markazId: markazId ? parseInt(markazId) : undefined,
        nama,
        musyrifId: musyrifId === "" ? null : (musyrifId ? parseInt(musyrifId) : undefined),
        kapasitas: kapasitas === "" ? null : (kapasitas ? parseInt(kapasitas) : undefined),
        aktif
      }
    });

    res.status(200).json({ message: 'Asrama berhasil diperbarui', asrama: updateAsrama });
  } catch (error) {
    console.error('Error updateAsrama:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAsrama = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah ada santri di asrama ini
    const countSantri = await prisma.santri.count({
      where: { asramaId: parseInt(id) }
    });

    if (countSantri > 0) {
      return res.status(400).json({ message: 'Tidak dapat menghapus asrama karena masih ada santri yang terdaftar' });
    }

    await prisma.asrama.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Asrama berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteAsrama:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// KARTU SANTRI
// =======================
exports.getKartuSantri = async (req, res) => {
  try {
    const { markazId, search } = req.query;
    
    let where = { status: 'AKTIF' };
    if (markazId && markazId !== 'SEMUA') {
      where.markazId = parseInt(markazId);
    }
    if (search) {
      where.registration = {
        studentName: { contains: search }
      };
    }

    const santriList = await prisma.santri.findMany({
      where,
      include: {
        registration: { select: { studentName: true, academicYear: true } },
        markaz: { select: { nama: true, kode: true } },
        kelasRef: { select: { nama: true } },
        kartuSantri: {
          include: {
            riwayat: true
          }
        }
      },
      orderBy: { registration: { studentName: 'asc' } },
      take: 200 // Limit for performance if needed, or implement pagination
    });

    res.status(200).json({ santri: santriList });
  } catch (error) {
    console.error('Error getKartuSantri:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.registerKartu = async (req, res) => {
  try {
    const { santriId, nomorKartu } = req.body;
    if (!santriId || !nomorKartu) {
      return res.status(400).json({ message: 'Santri dan Nomor Kartu wajib diisi' });
    }

    // Check if card number already used
    const existingCard = await prisma.kartuSantri.findUnique({
      where: { nomorKartu }
    });
    if (existingCard) {
      return res.status(400).json({ message: 'Nomor Kartu ini sudah terdaftar pada santri lain' });
    }

    const kartu = await prisma.kartuSantri.upsert({
      where: { santriId },
      update: { nomorKartu, aktif: true },
      create: {
        santriId,
        nomorKartu,
        aktif: true
      }
    });

    res.status(200).json({ message: 'Kartu berhasil didaftarkan', kartu });
  } catch (error) {
    console.error('Error registerKartu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.replaceKartu = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { nomorKartuBaru, alasan } = req.body;
    const adminId = req.user?.userId || req.user?.id;

    if (!nomorKartuBaru || !alasan) {
      return res.status(400).json({ message: 'Nomor Kartu Baru dan Alasan wajib diisi' });
    }

    // Check if new card number already used
    const existingCardCheck = await prisma.kartuSantri.findUnique({
      where: { nomorKartu: nomorKartuBaru }
    });
    if (existingCardCheck) {
      return res.status(400).json({ message: 'Nomor Kartu Baru sudah terdaftar pada santri lain' });
    }

    const kartuLama = await prisma.kartuSantri.findUnique({
      where: { santriId }
    });

    if (!kartuLama) {
      return res.status(404).json({ message: 'Santri ini belum memiliki kartu sebelumnya' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create riwayat
      await tx.riwayatKartu.create({
        data: {
          kartuId: kartuLama.id,
          nomorKartuLama: kartuLama.nomorKartu,
          alasan,
          diurusOlehId: adminId
        }
      });

      // Update kartu
      const updatedKartu = await tx.kartuSantri.update({
        where: { id: kartuLama.id },
        data: {
          nomorKartu: nomorKartuBaru,
          aktif: true
        }
      });

      return updatedKartu;
    });

    res.status(200).json({ message: 'Kartu berhasil diganti', kartu: result });
  } catch (error) {
    console.error('Error replaceKartu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.toggleStatusKartu = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { aktif } = req.body;

    const kartu = await prisma.kartuSantri.findUnique({ where: { santriId } });
    if (!kartu) {
      return res.status(404).json({ message: 'Kartu tidak ditemukan' });
    }

    const updatedKartu = await prisma.kartuSantri.update({
      where: { santriId },
      data: { aktif }
    });

    res.status(200).json({ message: aktif ? 'Kartu diaktifkan' : 'Kartu dinonaktifkan', kartu: updatedKartu });
  } catch (error) {
    console.error('Error toggleStatusKartu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRiwayatKartu = async (req, res) => {
  try {
    const { santriId } = req.params;
    const kartu = await prisma.kartuSantri.findUnique({
      where: { santriId },
      include: {
        riwayat: {
          include: { diurusOleh: { select: { namaLengkap: true } } },
          orderBy: { tanggalGanti: 'desc' }
        }
      }
    });

    if (!kartu) {
      return res.status(404).json({ message: 'Kartu tidak ditemukan' });
    }

    res.status(200).json({ riwayat: kartu.riwayat });
  } catch (error) {
    console.error('Error getRiwayatKartu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
