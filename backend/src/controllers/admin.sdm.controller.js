const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

// Helper: Urutkan posisi organisasi (Unit root paling atas)
const sortPosisiOrganisasi = async (pegawaiListOrSingle) => {
  const isArray = Array.isArray(pegawaiListOrSingle);
  const dataList = isArray ? pegawaiListOrSingle : [pegawaiListOrSingle];
  
  if (dataList.length === 0) return;

  let hasPosisi = false;
  for (const p of dataList) {
    if (p.posisiOrganisasi && p.posisiOrganisasi.length > 1) {
      hasPosisi = true;
      break;
    }
  }

  if (!hasPosisi) return;

  const allUnits = await prisma.sdmUnit.findMany({ select: { id: true, parentId: true } });
  const unitDepthMap = {};
  
  const getDepth = (unitId) => {
    if (unitDepthMap[unitId] !== undefined) return unitDepthMap[unitId];
    const unit = allUnits.find(u => u.id === unitId);
    if (!unit) return 0;
    if (!unit.parentId) {
      unitDepthMap[unitId] = 0;
      return 0;
    }
    const depth = 1 + getDepth(unit.parentId);
    unitDepthMap[unitId] = depth;
    return depth;
  };

  allUnits.forEach(u => getDepth(u.id));

  dataList.forEach(pegawai => {
    if (pegawai.posisiOrganisasi && pegawai.posisiOrganisasi.length > 1) {
      pegawai.posisiOrganisasi.sort((a, b) => {
        const depthA = unitDepthMap[a.unitId] || 0;
        const depthB = unitDepthMap[b.unitId] || 0;
        if (depthA !== depthB) return depthA - depthB;
        if (a.isKepala && !b.isKepala) return -1;
        if (!a.isKepala && b.isKepala) return 1;
        return a.nama.localeCompare(b.nama);
      });
    }
  });
};

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
          },
          pendidikan: { orderBy: { tahunLulus: 'desc' } },
          posisiOrganisasi: { include: { unit: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pegawai.count({ where: whereClause })
    ]);

    await sortPosisiOrganisasi(pegawaiList);

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

    const stats = {
      total: totalData,
      tetap: await prisma.pegawai.count({ where: { statusPegawai: 'TETAP' } }),
      kontrak: await prisma.pegawai.count({ where: { statusPegawai: 'KONTRAK' } }),
      pusat: await prisma.pegawai.count({ where: { penempatan: 'DIREKTORAT_PUSAT' } }),
      markaz: await prisma.pegawai.count({ where: { penempatan: 'MARKAZ' } }),
      komplek: await prisma.pegawai.count({ where: { tinggalDiKomplek: true } }),
      luarKomplek: await prisma.pegawai.count({ where: { tinggalDiKomplek: false } }),
      masaKerja: {
        kurangDariSatu: await prisma.pegawai.count({ where: { tanggalMasuk: { gt: oneYearAgo } } }),
        satuTiga: await prisma.pegawai.count({ where: { tanggalMasuk: { lte: oneYearAgo, gt: threeYearsAgo } } }),
        tigaLima: await prisma.pegawai.count({ where: { tanggalMasuk: { lte: threeYearsAgo, gt: fiveYearsAgo } } }),
        lebihDariLima: await prisma.pegawai.count({ where: { tanggalMasuk: { lte: fiveYearsAgo } } }),
      }
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
        markaz: true,
        pendidikan: { orderBy: { tahunLulus: 'desc' } },
        berkas: true,
        posisiOrganisasi: { include: { unit: true } }
      }
    });

    if (!pegawai) return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });

    await sortPosisiOrganisasi(pegawai);

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
        statusPegawai: data.statusPegawai || 'KONTRAK',
        tinggalDiKomplek: data.tinggalDiKomplek || false,
        domisiliMarkaz: data.domisiliMarkaz || null,
        jarakRumah: data.jarakRumah ? parseFloat(data.jarakRumah) : null,
        pendidikan: data.pendidikan && data.pendidikan.length > 0 ? {
          create: data.pendidikan.map(p => ({
            tingkat: p.tingkat,
            institusi: p.institusi,
            jurusan: p.jurusan || null,
            tahunLulus: p.tahunLulus ? parseInt(p.tahunLulus) : null,
            isTerakhir: p.isTerakhir || false
          }))
        } : undefined
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
        statusPegawai: data.statusPegawai || existing.statusPegawai,
        tinggalDiKomplek: data.tinggalDiKomplek !== undefined ? data.tinggalDiKomplek : existing.tinggalDiKomplek,
        domisiliMarkaz: data.domisiliMarkaz !== undefined ? data.domisiliMarkaz : existing.domisiliMarkaz,
        jarakRumah: data.jarakRumah !== undefined ? (data.jarakRumah ? parseFloat(data.jarakRumah) : null) : existing.jarakRumah,
        pendidikan: data.pendidikan ? {
          deleteMany: {},
          create: data.pendidikan.map(p => ({
            tingkat: p.tingkat,
            institusi: p.institusi,
            jurusan: p.jurusan || null,
            tahunLulus: p.tahunLulus ? parseInt(p.tahunLulus) : null,
            isTerakhir: p.isTerakhir || false
          }))
        } : undefined
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

const uploadFotoProfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    const userId = req.user.userId;
    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    // Update Pegawai
    const pegawai = await prisma.pegawai.update({
      where: { userId },
      data: { fotoUrl: fileUrl }
    });

    res.status(200).json({ 
      message: 'Foto profil berhasil diunggah',
      fotoUrl: fileUrl
    });
  } catch (error) {
    console.error("Error uploadFotoProfil:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const fs = require('fs');
const path = require('path');

const uploadPegawaiBerkas = async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }
    if (!jenis) {
      return res.status(400).json({ message: 'Jenis berkas tidak disertakan' });
    }

    const pegawai = await prisma.pegawai.findUnique({ where: { id } });
    if (!pegawai) {
      return res.status(404).json({ message: 'Data pegawai tidak ditemukan' });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`; // We use the same destination as uploadDisk for now
    
    const berkas = await prisma.pegawaiBerkas.create({
      data: {
        pegawaiId: id,
        jenis: jenis,
        namaFile: req.file.originalname,
        fileUrl: fileUrl
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'PegawaiBerkas',
      entityId: berkas.id,
      details: `Mengunggah berkas ${jenis} untuk pegawai: ${pegawai.namaLengkap}`,
      req
    });

    res.status(200).json({ message: 'Berkas berhasil diunggah', berkas });
  } catch (error) {
    console.error("Error uploadPegawaiBerkas:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePegawaiBerkas = async (req, res) => {
  try {
    const { id, berkasId } = req.params;

    const berkas = await prisma.pegawaiBerkas.findUnique({ where: { id: berkasId } });
    if (!berkas || berkas.pegawaiId !== id) {
      return res.status(404).json({ message: 'Berkas tidak ditemukan' });
    }

    await prisma.pegawaiBerkas.delete({ where: { id: berkasId } });

    // Hapus file fisik jika diperlukan (opsional, tapi disarankan)
    try {
      const fileName = path.basename(berkas.fileUrl);
      const filePath = path.join(__dirname, '../../public/uploads/avatars', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.error("Gagal menghapus file fisik:", fsError);
    }

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'PegawaiBerkas',
      entityId: berkasId,
      details: `Menghapus berkas ${berkas.jenis} untuk pegawai ID: ${id}`,
      req
    });

    res.status(200).json({ message: 'Berkas berhasil dihapus' });
  } catch (error) {
    console.error("Error deletePegawaiBerkas:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPegawaiBatch = async (req, res) => {
  try {
    const { pegawaiList } = req.body;

    if (!Array.isArray(pegawaiList) || pegawaiList.length === 0) {
      return res.status(400).json({ message: 'Data pegawai tidak valid atau kosong' });
    }

    // Pembersihan dan pemetaan data
    const validPegawaiList = pegawaiList
      .filter(p => p.nip && p.namaLengkap) // Pastikan NIP dan Nama Lengkap ada
      .map(p => ({
        nip: p.nip.trim(),
        namaLengkap: p.namaLengkap.trim(),
        jenisKelamin: 'LAKI_LAKI', // Default
        posisi: 'Staf', // Default
        penempatan: 'DIREKTORAT_PUSAT', // Default
        statusPegawai: 'KONTRAK', // Default
        tinggalDiKomplek: false,
      }));

    if (validPegawaiList.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data NIP dan Nama Lengkap yang valid dalam CSV' });
    }

    const result = await prisma.pegawai.createMany({
      data: validPegawaiList,
      skipDuplicates: true, // Abaikan NIP yang sudah ada
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'Pegawai',
      entityId: 'BATCH',
      details: `Mengunggah batch data pegawai via CSV sebanyak ${result.count} data baru.`,
      req
    });

    res.status(201).json({ 
      message: `Berhasil memproses upload CSV. ${result.count} data pegawai baru ditambahkan. NIP duplikat dilewati.`, 
      count: result.count 
    });
  } catch (error) {
    console.error("Error createPegawaiBatch:", error);
    res.status(500).json({ message: 'Internal server error saat import CSV' });
  }
};

module.exports = {
  getPegawaiList,
  getPegawaiById,
  createPegawai,
  createPegawaiBatch,
  updatePegawai,
  deletePegawai,
  linkAccount,
  getMyProfile,
  uploadFotoProfil,
  uploadPegawaiBerkas,
  deletePegawaiBerkas
};
