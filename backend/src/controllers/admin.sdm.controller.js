const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

// Mendapatkan daftar pegawai dengan filter dan pencarian
const getPegawaiList = async (req, res) => {
  try {
    const { search, penempatan, markazId, statusPegawai, limit = 50, page = 1 } = req.query;
    
    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { namaLengkap: { contains: search } },
        { nip: { contains: search } },
      ];
    }
    
    if (penempatan) whereClause.penempatan = penempatan;
    if (markazId) whereClause.markazId = parseInt(markazId);
    if (statusPegawai) whereClause.statusPegawai = statusPegawai;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [pegawaiList, totalData] = await Promise.all([
      prisma.pegawai.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, namaLengkap: true }
          },
          markaz: {
            select: { id: true, nama: true, kode: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pegawai.count({ where: whereClause })
    ]);

    const stats = {
      total: totalData,
      tetap: await prisma.pegawai.count({ where: { statusPegawai: 'TETAP' } }),
      kontrak: await prisma.pegawai.count({ where: { statusPegawai: 'KONTRAK' } }),
      pusat: await prisma.pegawai.count({ where: { penempatan: 'DIREKTORAT_PUSAT' } }),
      markaz: await prisma.pegawai.count({ where: { penempatan: 'MARKAZ' } }),
    };

    res.status(200).json({ 
      data: pegawaiList, 
      pagination: {
        total: totalData,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalData / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mendapatkan detail satu pegawai
const getPegawaiById = async (req, res) => {
  try {
    const { id } = req.params;
    const pegawai = await prisma.pegawai.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true } },
        markaz: true
      }
    });

    if (!pegawai) return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });

    res.status(200).json({ pegawai });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menambahkan pegawai baru
const createPegawai = async (req, res) => {
  try {
    const data = req.body;

    // Cek duplikasi NIP atau NIK
    if (data.nip) {
      const existingNip = await prisma.pegawai.findUnique({ where: { nip: data.nip } });
      if (existingNip) return res.status(400).json({ message: 'NIP sudah terdaftar' });
    }
    
    if (data.nik) {
      const existingNik = await prisma.pegawai.findUnique({ where: { nik: data.nik } });
      if (existingNik) return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    const newPegawai = await prisma.pegawai.create({
      data: {
        nip: data.nip,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        tempatLahir: data.tempatLahir || null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        nik: data.nik || null,
        noHp: data.noHp || null,
        email: data.email || null,
        alamat: data.alamat || null,
        posisi: data.posisi,
        penempatan: data.penempatan,
        markazId: data.penempatan === 'MARKAZ' && data.markazId ? parseInt(data.markazId) : null,
        tanggalMasuk: data.tanggalMasuk ? new Date(data.tanggalMasuk) : null,
        statusPegawai: data.statusPegawai || 'KONTRAK'
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'Pegawai',
      entityId: newPegawai.id,
      details: `Menambah pegawai baru: ${newPegawai.namaLengkap} (${newPegawai.nip})`,
      req
    });

    res.status(201).json({ message: 'Berhasil menambahkan data pegawai', pegawai: newPegawai });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mengupdate data pegawai
const updatePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.pegawai.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });

    // Cek duplikasi jika NIP atau NIK diubah
    if (data.nip && data.nip !== existing.nip) {
      const existingNip = await prisma.pegawai.findUnique({ where: { nip: data.nip } });
      if (existingNip) return res.status(400).json({ message: 'NIP sudah digunakan pegawai lain' });
    }
    if (data.nik && data.nik !== existing.nik) {
      const existingNik = await prisma.pegawai.findUnique({ where: { nik: data.nik } });
      if (existingNik) return res.status(400).json({ message: 'NIK sudah digunakan pegawai lain' });
    }

    const updated = await prisma.pegawai.update({
      where: { id },
      data: {
        nip: data.nip,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        tempatLahir: data.tempatLahir || null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        nik: data.nik || null,
        noHp: data.noHp || null,
        email: data.email || null,
        alamat: data.alamat || null,
        posisi: data.posisi,
        penempatan: data.penempatan,
        markazId: data.penempatan === 'MARKAZ' && data.markazId ? parseInt(data.markazId) : null,
        tanggalMasuk: data.tanggalMasuk ? new Date(data.tanggalMasuk) : null,
        statusPegawai: data.statusPegawai
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'Pegawai',
      entityId: id,
      details: `Mengupdate data pegawai: ${updated.namaLengkap}`,
      req
    });

    res.status(200).json({ message: 'Berhasil mengupdate data pegawai', pegawai: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menghapus data pegawai
const deletePegawai = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.pegawai.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });

    await prisma.pegawai.delete({ where: { id } });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'Pegawai',
      entityId: id,
      details: `Menghapus data pegawai: ${existing.namaLengkap} (${existing.nip})`,
      req
    });

    res.status(200).json({ message: 'Berhasil menghapus data pegawai' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menautkan profil Pegawai dengan akun Login User (Admin/Staff)
const linkAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const pegawai = await prisma.pegawai.findUnique({ where: { id } });
    if (!pegawai) return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });

    if (userId) {
      // Cek apakah user sudah ditautkan ke pegawai lain
      const existingLink = await prisma.pegawai.findUnique({ where: { userId } });
      if (existingLink && existingLink.id !== id) {
        return res.status(400).json({ message: 'Akun user ini sudah tertaut dengan profil pegawai lain' });
      }
    }

    const updated = await prisma.pegawai.update({
      where: { id },
      data: { userId: userId || null }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'Pegawai',
      entityId: id,
      details: userId 
        ? `Menautkan pegawai ${pegawai.namaLengkap} ke akun user ID ${userId}`
        : `Melepas tautan akun dari pegawai ${pegawai.namaLengkap}`,
      req
    });

    res.status(200).json({ message: userId ? 'Berhasil menautkan akun' : 'Berhasil melepas tautan akun', pegawai: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mendapatkan profil sdm diri sendiri
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. Data Pegawai
    const pegawai = await prisma.pegawai.findUnique({
      where: { userId },
      include: { markaz: true }
    });

    // 2. Data Hierarchy (Atasan & Bawahan)
    const hierarchy = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        supervisors: {
          include: {
            supervisor: { select: { namaLengkap: true, role: true } }
          }
        },
        subordinates: {
          include: {
            subordinate: { select: { namaLengkap: true, role: true } }
          }
        }
      }
    });

    res.status(200).json({ pegawai, hierarchy });
  } catch (error) {
    console.error("Error getMyProfile:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPegawaiList,
  getPegawaiById,
  createPegawai,
  updatePegawai,
  deletePegawai,
  linkAccount,
  getMyProfile
};
