const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const csv = require('csv-parser');
const stream = require('stream');
const bcrypt = require('bcryptjs');

exports.getSantriAktif = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, markazId, status } = req.query;

    let whereClause = {};

    if (status && status !== 'SEMUA') {
      whereClause.status = status;
    }

    // Role filtering for Markaz
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId || req.user.id } });
    const markazAccess = Array.isArray(currentUser?.markazAccess) ? currentUser.markazAccess : [];
    
    if (markazAccess.length > 0) {
      if (markazId && markazId !== 'SEMUA') {
        // If user requested a specific markaz, make sure they have access to it
        if (!markazAccess.includes(parseInt(markazId))) {
          return res.status(403).json({ success: false, message: "Akses ditolak untuk Markaz ini" });
        }
        whereClause.markazId = parseInt(markazId);
      } else {
        whereClause.markazId = { in: markazAccess };
      }
    } else {
      // Admin has access to all markaz
      if (markazId && markazId !== 'SEMUA') {
        whereClause.markazId = parseInt(markazId);
      }
    }

    if (search) {
      whereClause.OR = [
        { registration: { studentName: { contains: search } } },
        { nis: { contains: search } },
      ];
    }

    const [santriList, totalData] = await Promise.all([
      prisma.santri.findMany({
        where: whereClause,
        include: {
          registration: {
            select: {
              studentName: true,
              program: true,
              documents: true,
            }
          },
          markaz: true,
          kelasRef: true,
          asramaRef: true,
          waliSantri: {
            include: {
              user: {
                select: {
                  namaLengkap: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.santri.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      santri: santriList.map(s => ({
        ...s,
        kelas: s.kelasRef?.nama || "-",
        asrama: s.asramaRef?.nama || "-"
      })),
      pagination: {
        page,
        limit,
        totalData,
        totalPages: Math.ceil(totalData / limit)
      }
    });
  } catch (error) {
    console.error("getSantriAktif error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.importSantriCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File CSV tidak ditemukan." });
    }

    const bufferStr = req.file.buffer.toString('utf8');
    const firstLine = bufferStr.split('\n')[0] || '';
    const separator = firstLine.includes(';') ? ';' : ',';

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv({ 
        separator: separator,
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
      }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let successCount = 0;
        let failedCount = 0;
        let errors = [];

        // Pre-fetch Markaz mapping
        const markazList = await prisma.markaz.findMany();
        const markazMap = {};
        const markazNameMap = {};
        markazList.forEach(m => {
          if (m.kode) markazMap[m.kode.toUpperCase().trim()] = m.id;
          if (m.nama) markazNameMap[m.nama.toUpperCase().trim()] = m.id;
        });

        for (const [index, row] of results.entries()) {
          const rowNumber = index + 2; // header is row 1
          
          try {
            const nis = row['NIS']?.trim() || null;
            const namaSantri = (row['Nama Santri'] || row['Nama Santri (Wajib)'])?.trim();
            const jenisKelaminRaw = (row['Jenis Kelamin'] || row['Jenis Kelamin (L/P)'])?.trim().toUpperCase();
            const program = row['Program']?.trim() || 'SMP';
            const tahunAjaran = row['Tahun Ajaran']?.trim() || '2024/2025';
            const kodeMarkaz = (row['Kode Markaz'] || row['Markaz'])?.trim();
            const kelas = row['Kelas']?.trim();
            const asrama = row['Asrama']?.trim();
            const tahunMasukRaw = parseInt(row['Tahun Masuk']);
            const tahunMasuk = isNaN(tahunMasukRaw) ? new Date().getFullYear() : tahunMasukRaw;
            const namaWali = row['Nama Wali']?.trim() || 'Orang Tua Santri';
            const noHpWaliRaw = (row['No HP Wali'] || row['No HP Wali (Wajib)'])?.trim();
            const hubunganWaliRaw = (row['Hubungan Wali'] || row['Hubungan Wali (AYAH/IBU/WALI)'])?.trim().toUpperCase();

            if (!namaSantri || !noHpWaliRaw) {
              const detectedHeaders = Object.keys(row).map(k => `"${k}"`).join(', ');
              errors.push(`Baris ${rowNumber}: Nama Santri dan No HP Wali wajib diisi. (Kolom yang terdeteksi: ${detectedHeaders})`);
              failedCount++;
              continue;
            }

            const gender = (jenisKelaminRaw === 'P' || jenisKelaminRaw === 'PEREMPUAN') ? 'PEREMPUAN' : 'LAKI_LAKI';
            const hubunganWali = ['AYAH', 'IBU', 'WALI'].includes(hubunganWaliRaw) ? hubunganWaliRaw : 'WALI';
            const noHpWali = noHpWaliRaw.replace(/[^0-9+]/g, '');

            let markazId = null;
            if (kodeMarkaz) {
              const cleanedKode = kodeMarkaz.toUpperCase().trim();
              markazId = markazMap[cleanedKode] || markazNameMap[cleanedKode] || null;
            }

            await prisma.$transaction(async (tx) => {
              // 1. Cari atau buat User Wali
              let user = await tx.user.findFirst({ where: { phone: noHpWali } });

              if (!user) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                user = await tx.user.create({
                  data: {
                    namaLengkap: namaWali,
                    phone: noHpWali,
                    password: hashedPassword,
                    role: 'WALI_AKTIF',
                  }
                });
              } else if (user.role === 'CALON_WALI') {
                user = await tx.user.update({
                  where: { id: user.id },
                  data: { role: 'WALI_AKTIF' }
                });
              }

              // Cek apakah Santri sudah ada berdasarkan NIS
              let existingSantri = nis ? await tx.santri.findUnique({ where: { nis: nis } }) : null;
              let registrationId;
              let santriId;

              if (existingSantri) {
                // UPDATE jika sudah ada
                registrationId = existingSantri.id;
                santriId = existingSantri.id;
                
                await tx.registration.update({
                  where: { id: registrationId },
                  data: {
                    studentName: namaSantri,
                    gender: gender,
                    program: program,
                    academicYear: tahunAjaran,
                    markazId: markazId
                  }
                });

                await tx.santri.update({
                  where: { id: santriId },
                  data: {
                    markazId: markazId,
                    kelas: kelas || null,
                    asrama: asrama || null,
                    tahunMasuk: tahunMasuk
                  }
                });
              } else {
                // CREATE BARU
                const registration = await tx.registration.create({
                  data: {
                    userId: user.id,
                    studentName: namaSantri,
                    gender: gender,
                    program: program,
                    academicYear: tahunAjaran,
                    previousSchool: '-',
                    source: 'IMPORT_CSV',
                    motivation: 'Import Data Santri Aktif',
                    status: 'SELESAI',
                    markazId: markazId
                  }
                });
                registrationId = registration.id;
                santriId = registration.id;

                await tx.santri.create({
                  data: {
                    id: registrationId,
                    nis: nis,
                    markazId: markazId,
                    kelas: kelas || null,
                    asrama: asrama || null,
                    tahunMasuk: tahunMasuk,
                    status: 'AKTIF'
                  }
                });

                // Buat RegistrationData Dummy untuk data baru
                await tx.registrationData.create({
                  data: {
                    registrationId: registrationId,
                    nisn: null
                  }
                });
              }

              // 4. Buat/Update Relasi WaliSantri
              await tx.waliSantri.upsert({
                where: {
                  userId_santriId: { userId: user.id, santriId: santriId }
                },
                update: { hubungan: hubunganWali },
                create: {
                  userId: user.id,
                  santriId: santriId,
                  hubungan: hubunganWali,
                  isPrimary: true
                }
              });

            });

            successCount++;
          } catch (err) {
            console.error(`Row ${rowNumber} error:`, err);
            if (err.code === 'P2002') {
              errors.push(`Baris ${rowNumber}: Data duplikat (misal NIS sudah terdaftar).`);
            } else {
              errors.push(`Baris ${rowNumber}: ${err.message}`);
            }
            failedCount++;
          }
        }

        return res.json({
          success: true,
          message: `Import Selesai! Berhasil: ${successCount}, Gagal: ${failedCount}`,
          errors
        });
      });
  } catch (error) {
    console.error("importSantriCsv error:", error);
    res.status(500).json({ success: false, message: "Server Error saat memproses file." });
  }
};

exports.getSantriDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const santri = await prisma.santri.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            registrationData: {
              include: {
                siblings: true,
                mqSiblings: true
              }
            },
            documents: true
          }
        },
        markaz: true,
        kelasRef: true,
        asramaRef: true,
        waliSantri: {
          include: {
            user: {
              select: {
                id: true,
                namaLengkap: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: "Data santri tidak ditemukan" });
    }

    res.json({ 
      success: true, 
      santri: {
        ...santri,
        kelas: santri.kelasRef?.nama || "-",
        asrama: santri.asramaRef?.nama || "-"
      }
    });
  } catch (error) {
    console.error("getSantriDetail error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteSantri = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if santri has any transactions (Tagihan, Pembayaran, Tahfidz, dll)
    const santri = await prisma.santri.findUnique({
      where: { id },
      include: {
        tagihan: { take: 1 },
        pembayaran: { take: 1 },
        tahfidzCapaian: { take: 1 },
        kehadiran: { take: 1 },
        pelanggaran: { take: 1 },
        prestasi: { take: 1 }
      }
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: "Data santri tidak ditemukan" });
    }

    // Validation: Prevent deletion if there are related academic/financial records
    if (
      santri.tagihan.length > 0 ||
      santri.pembayaran.length > 0 ||
      santri.tahfidzCapaian.length > 0 ||
      santri.kehadiran.length > 0 ||
      santri.pelanggaran.length > 0 ||
      santri.prestasi.length > 0
    ) {
      return res.status(400).json({ 
        success: false, 
        message: "Santri ini sudah memiliki riwayat akademik/keuangan. Gunakan fitur 'Keluar'/'Lulus' (Update Status) alih-alih menghapusnya." 
      });
    }

    // Proceed with deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete WaliSantri mapping
      await tx.waliSantri.deleteMany({ where: { santriId: id } });
      
      // 2. Delete Santri
      await tx.santri.delete({ where: { id } });

      // 3. Delete RegistrationData & Registration (if exists and is IMPORT_CSV, or just delete anyway since Santri ID = Registration ID)
      const reg = await tx.registration.findUnique({ where: { id } });
      if (reg) {
        await tx.registrationData.deleteMany({ where: { registrationId: id } });
        await tx.document.deleteMany({ where: { registrationId: id } });
        await tx.parentInterview.deleteMany({ where: { registrationId: id } });
        await tx.interviewerEvaluation.deleteMany({ where: { registrationId: id } });
        await tx.surveyKunjungan.deleteMany({ where: { registrationId: id } }).catch(() => {});
        await tx.registration.delete({ where: { id } });

        // Optionally delete user if they were CALON_WALI or WALI_AKTIF without other children
        const otherRegs = await tx.registration.count({ where: { userId: reg.userId } });
        if (otherRegs === 0) {
          const user = await tx.user.findUnique({ where: { id: reg.userId } });
          if (user && (user.role === 'CALON_WALI' || user.role === 'WALI_AKTIF')) {
            await tx.user.delete({ where: { id: reg.userId } });
          }
        }
      }
    });

    res.json({ success: true, message: "Data santri berhasil dihapus secara permanen." });
  } catch (error) {
    console.error("deleteSantri error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat menghapus data santri." });
  }
};

exports.generateMassNis = async (req, res) => {
  try {
    const { academicYear, program, overwriteExisting } = req.body;
    
    if (!academicYear || !program) {
      return res.status(400).json({ success: false, message: "Tahun ajaran dan Program wajib diisi." });
    }

    // Parse Year Code: "2026/2027" -> "2627"
    let yearCode = "";
    if (academicYear.includes('/')) {
      const parts = academicYear.split('/');
      yearCode = parts[0].slice(-2) + parts[1].slice(-2);
    } else {
      yearCode = academicYear.slice(-4);
    }

    // Program Code
    let programCode = "99";
    const progUpper = program.toUpperCase();
    if (progUpper.includes('SMP')) programCode = '07';
    else if (progUpper.includes('SMA')) programCode = '03';
    else if (progUpper.includes('ALY') || progUpper.includes('ALI')) programCode = '04';
    else if (progUpper.includes('SD')) programCode = '02';
    else if (progUpper.includes('TK')) programCode = '01';

    const prefix = `${yearCode}${programCode}`;

    // Fetch santris
    const santris = await prisma.santri.findMany({
      where: {
        registration: {
          academicYear,
          program
        }
      },
      include: {
        registration: { select: { studentName: true } }
      }
    });

    if (santris.length === 0) {
      return res.status(404).json({ success: false, message: "Tidak ada santri aktif di tahun ajaran & program tersebut." });
    }

    // Filter santris based on overwriteExisting
    let santrisToProcess = santris;
    if (!overwriteExisting) {
      santrisToProcess = santris.filter(s => !s.nis || s.nis.startsWith('NIS-') || s.nis.trim() === '');
    }
    
    if (santrisToProcess.length === 0) {
      return res.status(400).json({ success: false, message: "Semua santri sudah memiliki NIS permanen. Centang 'Timpa NIS Lama' jika ingin mengurutkan ulang semuanya." });
    }

    // If we are NOT overwriting existing, we need to find the MAX sequence currently used by the existing santris of this prefix
    let startSequence = 1;
    if (!overwriteExisting) {
      const existingSantrisWithNis = santris.filter(s => s.nis && s.nis.startsWith(prefix) && s.nis.length >= prefix.length + 3);
      for (const s of existingSantrisWithNis) {
         const seqStr = s.nis.slice(prefix.length, prefix.length + 3);
         const seq = parseInt(seqStr, 10);
         if (!isNaN(seq) && seq >= startSequence) {
            startSequence = seq + 1;
         }
      }
    }

    // Sort alphabetically
    santrisToProcess.sort((a, b) => {
      const nameA = (a.registration?.studentName || "").toLowerCase();
      const nameB = (b.registration?.studentName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    let successCount = 0;
    await prisma.$transaction(async (tx) => {
      let currentSeq = startSequence;
      for (const s of santrisToProcess) {
        const seqStr = String(currentSeq).padStart(3, '0');
        const newNis = `${prefix}${seqStr}`;
        
        await tx.santri.update({
          where: { id: s.id },
          data: { nis: newNis }
        });
        
        currentSeq++;
        successCount++;
      }
    });

    res.json({ 
      success: true, 
      message: `Berhasil men-generate ${successCount} NIS secara berurutan sesuai abjad.`,
      prefix 
    });

  } catch (error) {
    console.error("generateMassNis error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

exports.getSantriWaliKelas = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId || req.user.id },
      include: {
        pegawai: {
          include: {
            kelasWali: true
          }
        }
      }
    });

    if (!user || !user.pegawai || !user.pegawai.kelasWali || user.pegawai.kelasWali.length === 0) {
      return res.status(403).json({ success: false, message: "Akses ditolak. Anda bukan Wali Kelas." });
    }

    const kelasIds = user.pegawai.kelasWali.map(k => k.id);

    const santriList = await prisma.santri.findMany({
      where: {
        kelasId: { in: kelasIds },
        status: 'AKTIF'
      },
      include: {
        registration: {
          select: {
            studentName: true,
            program: true,
            gender: true
          }
        },
        kelasRef: true,
        asramaRef: true
      },
      orderBy: {
        registration: {
          studentName: 'asc'
        }
      }
    });

    res.json({ 
      success: true, 
      santri: santriList.map(s => ({
        ...s,
        kelas: s.kelasRef?.nama || "-",
        asrama: s.asramaRef?.nama || "-"
      }))
    });
  } catch (error) {
    console.error("getSantriWaliKelas error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateSantriDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, nis, program, gender, kelasId, asramaId, nik, nisn, birthPlace, birthDate, status } = req.body;

    const { mergePermissions } = require('../utils/permission');
    
    // Fetch the user to get real permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId || req.user.id },
      include: { adminGroups: true }
    });

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const userPermissions = mergePermissions(currentUser.permissions, currentUser.adminGroups);
    const isSuperAdmin = userPermissions.includes('MANAJEMEN_ADMIN');
    const canEdit = isSuperAdmin || userPermissions.includes('SANTRI_EDIT');

    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengedit data santri.' });
    }

    const santri = await prisma.santri.findUnique({
      where: { id: id },
      include: { registration: { include: { registrationData: true } } }
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: 'Data santri tidak ditemukan.' });
    }

    const regId = santri.registrationId;
    const regDataId = santri.registration?.registrationData?.id;

    await prisma.$transaction(async (tx) => {
      // Update Santri Table
      await tx.santri.update({
        where: { id: id },
        data: {
          nis: nis !== undefined ? nis : santri.nis,
          kelasId: kelasId ? parseInt(kelasId) : santri.kelasId,
          asramaId: asramaId ? parseInt(asramaId) : santri.asramaId,
          status: status !== undefined ? status : santri.status
        }
      });

      // Update Registration Table
      if (regId) {
        await tx.registration.update({
          where: { id: regId },
          data: {
            studentName: studentName !== undefined ? studentName : santri.registration?.studentName,
            program: program !== undefined ? program : santri.registration?.program,
            gender: gender !== undefined ? gender : santri.registration?.gender
          }
        });
      }

      // Update RegistrationData Table
      if (regDataId) {
        await tx.registrationData.update({
          where: { id: regDataId },
          data: {
            nik: nik !== undefined ? nik : santri.registration?.registrationData?.nik,
            nisn: nisn !== undefined ? nisn : santri.registration?.registrationData?.nisn,
            birthPlace: birthPlace !== undefined ? birthPlace : santri.registration?.registrationData?.birthPlace,
            birthDate: birthDate ? new Date(birthDate) : santri.registration?.registrationData?.birthDate
          }
        });
      }
    });

    res.json({ success: true, message: 'Data santri berhasil diperbarui.' });
  } catch (error) {
    console.error("updateSantriDetail error:", error);
    res.status(500).json({ success: false, message: "Server Error saat memperbarui data." });
  }
};
