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
            }
          },
          markaz: true,
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
      santri: santriList,
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
        markazList.forEach(m => {
          markazMap[m.kode.toUpperCase()] = m.id;
        });

        for (const [index, row] of results.entries()) {
          const rowNumber = index + 2; // header is row 1
          
          try {
            const nis = row['NIS']?.trim() || null;
            const namaSantri = (row['Nama Santri'] || row['Nama Santri (Wajib)'])?.trim();
            const jenisKelaminRaw = (row['Jenis Kelamin'] || row['Jenis Kelamin (L/P)'])?.trim().toUpperCase();
            const program = row['Program']?.trim() || 'SMP';
            const tahunAjaran = row['Tahun Ajaran']?.trim() || '2024/2025';
            const kodeMarkaz = row['Kode Markaz']?.trim();
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

            const markazId = kodeMarkaz ? (markazMap[kodeMarkaz.toUpperCase()] || null) : null;

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
