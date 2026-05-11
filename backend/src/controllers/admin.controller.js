const prisma = require('../lib/prisma');

// Ambil semua data PPDB
const getPpdbList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search, interviewerId, markazId } = req.query;

    let whereClause = {
      source: { not: 'IMPORT_CSV' }
    };
    if (status && status !== 'SEMUA') {
      whereClause.status = status;
    }

    // Role filtering for PENGUJI and Markaz
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId || req.user.id } });
    const userPermissions = currentUser?.permissions || [];
    const markazAccess = Array.isArray(currentUser?.markazAccess) ? currentUser.markazAccess : [];

    if (markazAccess.length > 0) {
      if (markazId && markazId !== 'SEMUA') {
        if (!markazAccess.includes(parseInt(markazId))) {
          return res.status(403).json({ message: 'Akses ditolak untuk Markaz ini' });
        }
        whereClause.markazId = parseInt(markazId);
      } else {
        whereClause.markazId = { in: markazAccess };
      }
    } else {
      if (markazId && markazId !== 'SEMUA') {
        whereClause.markazId = parseInt(markazId);
      }
    }

    const isSuperAdmin = userPermissions.includes('MANAJEMEN_ADMIN');
    const hasFullPpdb = isSuperAdmin || userPermissions.includes('PPDB') || userPermissions.some(p => p.startsWith('SPMB_PESERTA'));
    const hasWawancara = userPermissions.includes('PPDB_WAWANCARA') || userPermissions.includes('SPMB_SURVEY_EDIT');

    if (!hasFullPpdb && hasWawancara) {
      whereClause.interviewerId = req.user.userId;
    } else if (interviewerId) {
      whereClause.interviewerId = interviewerId;
    }
    
    if (search) {
      whereClause.OR = [
        { studentName: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { phone: { contains: search } } }
      ];
    }

    const [registrations, totalData] = await Promise.all([
      prisma.registration.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true, phone: true } },
          registrationData: { select: { nickname: true } },
          markaz: true
        }
      }),
      prisma.registration.count({ where: whereClause })
    ]);

    res.status(200).json({ 
      registrations, 
      pagination: {
        page,
        limit,
        totalData,
        totalPages: Math.ceil(totalData / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Pendaftaran Offline (Bypass Admin)
const offlineRegister = async (req, res) => {
  try {
    const { 
      studentName, whatsapp, email, program, 
      academicYear, gender, previousSchool, source, motivation,
      sudahBayarRegistrasi 
    } = req.body;
    
    if (!studentName || !whatsapp || !program) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const bcrypt = require('bcryptjs');
    let user = await prisma.user.findUnique({ where: { phone: whatsapp } });

    if (!user) {
      const userEmail = email || `${whatsapp}@mymq.local`;
      const hashedPassword = await bcrypt.hash('mqbs2026', 10);
      user = await prisma.user.create({
        data: {
          phone: whatsapp,
          email: userEmail,
          password: hashedPassword,
          role: 'CALON_WALI',
          namaLengkap: `Bapak/Ibu dari ${studentName}`
        }
      });
    }

    // Determine Status
    const isLanjutan = program === 'SMA' && previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)";
    const status = sudahBayarRegistrasi ? (isLanjutan ? 'TES_WAWANCARA' : 'KELENGKAPAN_DATA') : 'PEMBAYARAN_REGISTRASI';

    // Determine Markaz
    let mappedGender = 'LAKI_LAKI';
    if (gender === 'Laki-laki' || gender === 'LAKI_LAKI') mappedGender = 'LAKI_LAKI';
    if (gender === 'Perempuan' || gender === 'PEREMPUAN') mappedGender = 'PEREMPUAN';

    let determinedMarkazId = 1; // Default to SMP/SD Laki-laki
    if (mappedGender === 'PEREMPUAN') {
      determinedMarkazId = 3; // Semua Perempuan
    } else if (mappedGender === 'LAKI_LAKI' && program === 'SMA') {
      determinedMarkazId = 2; // SMA Laki-laki
    }

    // Create Registration
    const registration = await prisma.registration.create({
      data: {
        userId: user.id,
        studentName,
        markazId: determinedMarkazId,
        program,
        status,
        academicYear: academicYear || '2026/2027',
        gender: mappedGender,
        previousSchool: previousSchool || '-',
        source: source || 'Datang Langsung / Admin',
        motivation: motivation || 'Didukung penuh oleh orang tua',
        testMethod: 'OFFLINE'
      }
    });

    if (sudahBayarRegistrasi) {
      await prisma.pembayaran.create({
        data: {
          userId: user.id,
          registrationId: registration.id,
          totalNominal: 300000,
          metode: 'TUNAI',
          status: 'LUNAS',
          catatan: 'Dibayar tunai / Langsung via Admin',
          paidAt: new Date()
        }
      });
    }

    res.status(201).json({ message: 'Pendaftar berhasil ditambahkan', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Perbarui Data Peserta (Bypass Admin)
const updateRegistrationData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });

    const fields = [
      'nik', 'nisn', 'noKk', 'nickname', 'birthPlace', 'childNumber', 'siblingCount',
      'achievements', 'medicalHistory', 'talents', 'fatherName', 'fatherAge', 'fatherEducation',
      'fatherOccupation', 'fatherIncome', 'fatherAddress', 'motherName', 'motherAge', 
      'motherEducation', 'motherOccupation', 'motherIncome', 'motherAddress'
    ];
    
    const dataObj = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        // Convert to int if necessary
        if (['childNumber', 'siblingCount', 'fatherAge', 'motherAge'].includes(f)) {
          dataObj[f] = req.body[f] ? parseInt(req.body[f]) : null;
        } else {
          dataObj[f] = req.body[f];
        }
      }
    });

    if (req.body.birthDate) dataObj.birthDate = new Date(req.body.birthDate);
    if (req.body.parentStatus) dataObj.parentStatus = req.body.parentStatus;

    // Handle Registration basic fields
    const regFields = ['studentName', 'program', 'gender', 'academicYear', 'markazId', 'previousSchool'];
    const regObj = {};
    regFields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'markazId') regObj[f] = req.body[f] ? parseInt(req.body[f]) : null;
        else regObj[f] = req.body[f];
      }
    });

    const upsertedData = await prisma.$transaction(async (tx) => {
      // Update Registration basic fields if any
      if (Object.keys(regObj).length > 0) {
        await tx.registration.update({
          where: { id },
          data: regObj
        });
        
        // If markazId changed and Santri exists, sync it
        if (regObj.markazId !== undefined) {
          const santriExists = await tx.santri.findUnique({ where: { id } });
          if (santriExists) {
            await tx.santri.update({
              where: { id },
              data: { markazId: regObj.markazId }
            });
          }
        }
      }

      const data = await tx.registrationData.upsert({
        where: { registrationId: id },
        update: dataObj,
        create: {
          registrationId: id,
          ...dataObj
        }
      });

      // Handle Siblings
      if (req.body.siblings !== undefined && Array.isArray(req.body.siblings)) {
        await tx.sibling.deleteMany({ where: { registrationDataId: data.id } });
        if (req.body.siblings.length > 0) {
          await tx.sibling.createMany({
            data: req.body.siblings.map(s => ({
              registrationDataId: data.id,
              name: s.name,
              age: s.age ? parseInt(s.age) : null,
              education: s.education,
              occupation: s.occupation
            }))
          });
        }
      }

      // Handle MqSiblings
      if (req.body.mqSiblings !== undefined && Array.isArray(req.body.mqSiblings)) {
        await tx.mqSibling.deleteMany({ where: { registrationDataId: data.id } });
        if (req.body.mqSiblings.length > 0) {
          await tx.mqSibling.createMany({
            data: req.body.mqSiblings.map(s => ({
              registrationDataId: data.id,
              name: s.name,
              program: s.program,
              class: s.class
            }))
          });
        }
      }

      return data;
    });

    res.status(200).json({ message: 'Data peserta berhasil diperbarui', data: upsertedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ambil statistik dashboard PPDB
const getDashboardStats = async (req, res) => {
  try {
    const { markazId, program, startDate, endDate } = req.query;
    let whereClause = {};

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId || req.user.id } });
    const markazAccess = Array.isArray(currentUser?.markazAccess) ? currentUser.markazAccess : [];

    if (markazAccess.length > 0) {
      if (markazId && markazId !== 'SEMUA') {
        if (!markazAccess.includes(parseInt(markazId))) {
          return res.status(403).json({ message: 'Akses ditolak untuk Markaz ini' });
        }
        whereClause.markazId = parseInt(markazId);
      } else {
        whereClause.markazId = { in: markazAccess };
      }
    } else {
      if (markazId && markazId !== 'SEMUA') {
        whereClause.markazId = parseInt(markazId);
      }
    }

    if (program && program !== 'SEMUA') {
      whereClause.program = program;
    }
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    const userPermissions = currentUser?.permissions || [];
    const isSuperAdmin = userPermissions.includes('MANAJEMEN_ADMIN');
    const hasFullPpdb = isSuperAdmin || userPermissions.includes('PPDB') || userPermissions.some(p => p.startsWith('SPMB_PESERTA'));
    const hasWawancara = userPermissions.includes('PPDB_WAWANCARA') || userPermissions.includes('SPMB_SURVEY_EDIT');

    if (!hasFullPpdb && hasWawancara) {
      whereClause.interviewerId = req.user.userId;
    }

    const registrations = await prisma.registration.findMany({
      where: whereClause,
      select: {
        status: true,
        source: true,
        createdAt: true,
        program: true,
        markazId: true,
        previousSchool: true,
        markaz: { select: { nama: true, kode: true } }
      }
    });

    const funnel = {
      PENDAFTARAN: 0,
      PEMBAYARAN_REGISTRASI: 0,
      KELENGKAPAN_DATA: 0,
      TES_WAWANCARA: 0,
      PENGUMUMAN: 0,
      DAFTAR_ULANG: 0,
      SELESAI: 0,
      DITOLAK: 0,
      TIDAK_LANJUT_BAYAR_REGISTRASI: 0,
      TIDAK_LANJUT_TES: 0,
      TIDAK_LANJUT_DAFTAR_ULANG: 0,
      TIDAK_LANJUT_JADI_SANTRI: 0
    };

    const sourceMap = {};
    const dailyMap = {};

    const breakdownMap = {};

    registrations.forEach(reg => {
      // Funnel
      if (funnel[reg.status] !== undefined) {
        funnel[reg.status] += 1;
      }

      // Source
      const src = reg.source || 'Lainnya';
      sourceMap[src] = (sourceMap[src] || 0) + 1;

      // Daily
      const dateStr = reg.createdAt.toISOString().split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;

      // Breakdown per Markaz & Program
      const mName = reg.markaz?.kode || 'Belum Ditentukan';
      
      let pName = reg.program || 'Tidak Diketahui';
      if (pName === 'SMA' && reg.previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)") {
        pName = 'SMA Lanjutan';
      }
      
      const key = `${mName}_${pName}`;
      
      if (!breakdownMap[key]) {
        breakdownMap[key] = { markaz: mName, program: pName, totalDaftar: 0, fixSantri: 0 };
      }
      
      breakdownMap[key].totalDaftar += 1;
      // User specifies "Fix Jadi Santri dari yang Daftar Ulang saja". 
      // We assume DAFTAR_ULANG or SELESAI status.
      if (['DAFTAR_ULANG', 'SELESAI'].includes(reg.status)) {
        breakdownMap[key].fixSantri += 1;
      }
    });

    const sources = Object.keys(sourceMap).map(name => ({ name, value: sourceMap[name] })).sort((a,b) => b.value - a.value);
    const daily = Object.keys(dailyMap).sort().map(date => ({ date, count: dailyMap[date] }));
    const breakdown = Object.values(breakdownMap).sort((a, b) => a.markaz.localeCompare(b.markaz) || a.program.localeCompare(b.program));

    const bayarRegistrasiTotal = funnel.PEMBAYARAN_REGISTRASI + funnel.KELENGKAPAN_DATA + funnel.TES_WAWANCARA + funnel.PENGUMUMAN + funnel.DAFTAR_ULANG + funnel.SELESAI + funnel.DITOLAK + funnel.TIDAK_LANJUT_TES + funnel.TIDAK_LANJUT_DAFTAR_ULANG + funnel.TIDAK_LANJUT_JADI_SANTRI;
    const tesWawancaraTotal = funnel.TES_WAWANCARA + funnel.PENGUMUMAN + funnel.DAFTAR_ULANG + funnel.SELESAI + funnel.DITOLAK + funnel.TIDAK_LANJUT_DAFTAR_ULANG + funnel.TIDAK_LANJUT_JADI_SANTRI;
    const daftarUlangTotal = funnel.DAFTAR_ULANG + funnel.SELESAI + funnel.TIDAK_LANJUT_JADI_SANTRI;

    res.status(200).json({
      summary: {
        total: registrations.length,
        daftar: registrations.length,
        bayarRegistrasi: bayarRegistrasiTotal,
        tesWawancara: tesWawancaraTotal,
        daftarUlang: daftarUlangTotal,
        batal: funnel.DITOLAK + funnel.TIDAK_LANJUT_BAYAR_REGISTRASI + funnel.TIDAK_LANJUT_TES + funnel.TIDAK_LANJUT_DAFTAR_ULANG + funnel.TIDAK_LANJUT_JADI_SANTRI,
        tidakLanjutBayar: funnel.TIDAK_LANJUT_BAYAR_REGISTRASI,
        tidakLanjutTes: funnel.TIDAK_LANJUT_TES,
        tidakLanjutDaftarUlang: funnel.TIDAK_LANJUT_DAFTAR_ULANG,
        tidakLanjutJadiSantri: funnel.TIDAK_LANJUT_JADI_SANTRI
      },
      funnel,
      sources,
      daily,
      breakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ambil detail lengkap PPDB
const getPpdbDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        user: { 
          select: { 
            email: true, 
            phone: true
          } 
        },
        examAttempts: {
          where: { status: 'COMPLETED' },
          include: { 
            exam: { select: { title: true, passingGrade: true } },
            answers: { include: { question: { select: { text: true, options: true, correctOption: true, category: true } } } }
          }
        },
        registrationData: {
          include: {
            siblings: true,
            mqSiblings: true
          }
        },
        documents: true,
        parentInterview: true,
        interviewerEvaluation: true,
        interviewer: {
          select: { namaLengkap: true, email: true }
        },
        pembayaran: true
      }
    });

    if (!registration) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.status(200).json({ registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Dokumen
const updateDocumentStatus = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { status, notes } = req.body; // status: DITERIMA, DITOLAK, REVISI
    
    await prisma.document.update({
      where: { id: docId, registrationId: id },
      data: { status, notes }
    });

    res.status(200).json({ message: 'Status dokumen diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update jadwal tes (online/offline)
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { testMethod, testDate, interviewDate, interviewerId } = req.body;
    
    // Auto-generate offlineCode if changing to OFFLINE
    let offlineCode = undefined;
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (testMethod === 'OFFLINE' && reg.testMethod !== 'OFFLINE' && !reg.offlineCode) {
      // Generate a random 5-character uppercase alphanumeric code
      offlineCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: {
        testMethod,
        testDate: testDate ? new Date(testDate) : null,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        interviewerId: interviewerId || null,
        ...(offlineCode && { offlineCode })
      }
    });

    res.status(200).json({ message: 'Jadwal tes berhasil diperbarui', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ambil daftar penguji (Admin yang memiliki izin PPDB_WAWANCARA)
const getPengujiList = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'ADMIN_PUSAT',
        OR: [
          { permissions: { array_contains: 'SPMB_SURVEY_EDIT' } },
          { permissions: { array_contains: 'SPMB_PESERTA_VIEW' } },
          { permissions: { array_contains: 'PPDB_WAWANCARA' } },
          { permissions: { array_contains: 'PPDB' } },
          { permissions: { array_contains: 'MANAJEMEN_ADMIN' } }
        ]
      },
      select: { id: true, namaLengkap: true, email: true }
    });
    res.status(200).json({ penguji: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check-in Offline (Hadir)
const checkInOffline = async (req, res) => {
  try {
    const { offlineCode } = req.body;
    if (!offlineCode) return res.status(400).json({ message: 'Kode diperlukan' });

    const registration = await prisma.registration.findFirst({
      where: { offlineCode: offlineCode.toUpperCase() },
      include: { registrationData: { select: { nickname: true } }, user: { select: { namaLengkap: true } } }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Kode check-in tidak valid atau tidak ditemukan' });
    }

    if (registration.attendance === 'PRESENT') {
      return res.status(400).json({ message: 'Peserta sudah melakukan check-in sebelumnya' });
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        attendance: 'PRESENT',
        attendanceTime: new Date()
      }
    });

    res.status(200).json({ 
      message: 'Check-in berhasil', 
      studentName: registration.studentName,
      time: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Proses Kelulusan & Penetapan Santri (Admin tidak sembarang ubah status)
const processKelulusan = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, uangMasukNominal, sppNominal } = req.body; 
    // action: "LULUS", "TIDAK_LULUS", "JADI_SANTRI"

    const reg = await prisma.registration.findUnique({ where: { id }, include: { registrationData: true } });
    if (!reg) return res.status(404).json({ message: 'Data tidak ditemukan' });

    let newStatus = reg.status;

    if (action === 'LULUS') {
      newStatus = 'DAFTAR_ULANG'; // Masuk tahap daftar ulang
    } else if (action === 'TIDAK_LULUS') {
      newStatus = 'DITOLAK';
    } else if (action === 'TIDAK_LANJUT_BAYAR_REGISTRASI') {
      newStatus = 'TIDAK_LANJUT_BAYAR_REGISTRASI';
    } else if (action === 'TIDAK_LANJUT_TES') {
      newStatus = 'TIDAK_LANJUT_TES';
    } else if (action === 'TIDAK_LANJUT_DAFTAR_ULANG') {
      newStatus = 'TIDAK_LANJUT_DAFTAR_ULANG';
    } else if (action === 'TIDAK_LANJUT_JADI_SANTRI') {
      newStatus = 'TIDAK_LANJUT_JADI_SANTRI';
    } else if (['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(action)) {
      newStatus = action;
    } else if (action === 'JADI_SANTRI') {
      newStatus = 'SELESAI';
      // Auto create Santri & WaliSantri records
      
      // 1. Get or Create Markaz? Default to something or null.
      // 2. Create Santri
      const santriExists = await prisma.santri.findUnique({ where: { id: reg.id } });
      if (!santriExists) {
        await prisma.santri.create({
          data: {
            id: reg.id,
            nis: null, // NIS di-generate secara massal nanti
            kelas: "10", // Default, admin bisa ubah nanti di modul Santri
            asrama: "Asrama Ibnu Abbas",
            tahunMasuk: new Date().getFullYear(),
            sppNominal: reg.sppNominal || 1900000,
            status: "AKTIF"
          }
        });
      }

      // 3. Create WaliSantri relationship
      const waliExists = await prisma.waliSantri.findFirst({
        where: { userId: reg.userId, santriId: reg.id }
      });
      if (!waliExists) {
        await prisma.waliSantri.create({
          data: {
            userId: reg.userId,
            santriId: reg.id,
            hubungan: "AYAH" // Default
          }
        });
      }

      // 4. Update user role to WALI_AKTIF if they are CALON_WALI
      const user = await prisma.user.findUnique({ where: { id: reg.userId } });
      if (user.role === 'CALON_WALI') {
        await prisma.user.update({
          where: { id: reg.userId },
          data: { role: 'WALI_AKTIF' }
        });
      }
    }

    let updateData = { status: newStatus };
    if (action === 'LULUS') {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 14); // 14 days from now
      updateData.uangMasukDeadline = deadline;
      updateData.uangMasukNominal = uangMasukNominal || 15000000;
      updateData.sppNominal = sppNominal || 1900000;
    }

    await prisma.registration.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: `Proses ${action} berhasil, status: ${newStatus}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Uang Masuk Nominal
const updateUangMasukNominal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nominal, sppNominal } = req.body;

    if (nominal !== undefined && (isNaN(nominal) || Number(nominal) < 0)) {
      return res.status(400).json({ message: 'Nominal Uang Masuk tidak valid' });
    }
    if (sppNominal !== undefined && (isNaN(sppNominal) || Number(sppNominal) < 0)) {
      return res.status(400).json({ message: 'Nominal SPP tidak valid' });
    }

    const dataToUpdate = {};
    if (nominal !== undefined) dataToUpdate.uangMasukNominal = Number(nominal);
    if (sppNominal !== undefined) dataToUpdate.sppNominal = Number(sppNominal);

    await prisma.registration.update({
      where: { id },
      data: dataToUpdate
    });

    // Also update Santri if it exists
    if (sppNominal !== undefined) {
      await prisma.santri.updateMany({
        where: { id },
        data: { sppNominal: Number(sppNominal) }
      });
    }

    res.status(200).json({ message: 'Nominal berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Uang Masuk Deadline
const updateUangMasukDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { deadline, waiverFileUrl } = req.body;

    if (!deadline || !waiverFileUrl) {
      return res.status(400).json({ message: 'Deadline baru dan file Surat Keringanan Wajib disertakan' });
    }

    await prisma.registration.update({
      where: { id },
      data: {
        uangMasukDeadline: new Date(deadline),
        uangMasukWaiverFileUrl: waiverFileUrl
      }
    });

    res.status(200).json({ message: 'Tenggat waktu berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Catat Pembayaran Manual (Admin Kasir)
const recordManualPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { nominal, metode, bank, buktiUrl, catatan, isRegistrationFee } = req.body;

    const reg = await prisma.registration.findUnique({
      where: { id },
      include: { pembayaran: true }
    });

    if (!reg) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Validate methods
    if (!['TUNAI', 'TRANSFER_BANK'].includes(metode)) {
      return res.status(400).json({ message: 'Metode pembayaran manual harus TUNAI atau TRANSFER_BANK' });
    }

    // Create payment record
    await prisma.pembayaran.create({
      data: {
        userId: reg.userId,
        registrationId: reg.id,
        totalNominal: nominal,
        metode: metode,
        bank: bank || null,
        status: 'LUNAS', // direct manual record is considered LUNAS
        buktiUrl: buktiUrl || null,
        catatan: catatan || 'Dicatat secara manual oleh Admin/Kasir',
        paidAt: new Date()
      }
    });

    // If it's registration fee, move status
    if (isRegistrationFee && (reg.status === 'PEMBAYARAN_REGISTRASI' || reg.status === 'KELENGKAPAN_DATA')) {
      const hasData = await prisma.registrationData.findUnique({
        where: { registrationId: reg.id }
      });
      const isLanjutan = reg.program === 'SMA' && reg.previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)";
      const newStatus = (hasData || isLanjutan) ? 'TES_WAWANCARA' : 'KELENGKAPAN_DATA';
      await prisma.registration.update({
        where: { id },
        data: { status: newStatus }
      });
    }

    res.status(200).json({ message: 'Pembayaran manual berhasil dicatat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// MANAJEMEN AKUN ADMIN
// ==========================================

const { logActivity } = require('../utils/logger');

const getAdminList = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { 
        role: { notIn: ['WALI_AKTIF', 'CALON_WALI'] }
      },
      select: { id: true, email: true, namaLengkap: true, role: true, permissions: true, portalAppsAccess: true, markazAccess: true, createdAt: true, adminGroups: { select: { id: true, nama: true } } }
    });
    res.status(200).json({ admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        namaLengkap: true, 
        phone: true,
        permissions: true, 
        portalAppsAccess: true, 
        markazAccess: true, 
        createdAt: true, 
        adminGroups: { select: { id: true, nama: true, permissions: true } } 
      }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, namaLengkap, permissions, portalAppsAccess, markazAccess, groupIds } = req.body;
    
    // Check if MANAJEMEN_ADMIN permission exists for current user
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!currentUser.permissions || !currentUser.permissions.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki hak akses MANAJEMEN_ADMIN.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        namaLengkap,
        role: 'ADMIN_PUSAT',
        permissions: permissions || [],
        portalAppsAccess: portalAppsAccess || [],
        markazAccess: markazAccess || [],
        adminGroups: groupIds ? {
          connect: groupIds.map(gId => ({ id: gId }))
        } : undefined
      },
      select: { id: true, email: true, namaLengkap: true, permissions: true, portalAppsAccess: true, markazAccess: true, adminGroups: { select: { id: true, nama: true } } }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'Admin',
      entityId: newAdmin.id,
      details: `Membuat akun admin baru: ${email}`,
      req
    });

    res.status(201).json({ message: 'Admin berhasil ditambahkan', admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, namaLengkap, permissions, portalAppsAccess, markazAccess, groupIds } = req.body;

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!currentUser.permissions || !currentUser.permissions.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki hak akses MANAJEMEN_ADMIN.' });
    }

    const updateData = { email, namaLengkap, permissions, portalAppsAccess, markazAccess };
    
    if (groupIds) {
      updateData.adminGroups = { set: groupIds.map(gId => ({ id: gId })) };
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, namaLengkap: true, permissions: true, portalAppsAccess: true, markazAccess: true, adminGroups: { select: { id: true, nama: true } } }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'Admin',
      entityId: updated.id,
      details: `Memperbarui akun admin: ${email}`,
      req
    });

    res.status(200).json({ message: 'Admin berhasil diperbarui', admin: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!currentUser.permissions || !currentUser.permissions.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    if (id === req.user.userId) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri.' });
    }

    await prisma.user.delete({ where: { id } });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'Admin',
      entityId: id,
      details: `Menghapus akun admin ID: ${id}`,
      req
    });

    res.status(200).json({ message: 'Admin berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Evaluasi Pewawancara
const updateInterviewerEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      santriRecommendation,
      santriNotes,
      santriInterviewer,
      parentRecommendation,
      parentNotes,
      parentInterviewer,
      santriRubricAnswers,
      parentRubricAnswers
    } = req.body;

    // Check if evaluation already exists
    const existing = await prisma.interviewerEvaluation.findUnique({
      where: { registrationId: id }
    });

    let evaluation;
    if (existing) {
      evaluation = await prisma.interviewerEvaluation.update({
        where: { registrationId: id },
        data: {
          santriRecommendation,
          santriNotes,
          santriInterviewer,
          parentRecommendation,
          parentNotes,
          parentInterviewer,
          santriRubricAnswers,
          parentRubricAnswers
        }
      });
    } else {
      evaluation = await prisma.interviewerEvaluation.create({
        data: {
          registrationId: id,
          santriRecommendation,
          santriNotes,
          santriInterviewer,
          parentRecommendation,
          parentNotes,
          parentInterviewer,
          santriRubricAnswers,
          parentRubricAnswers
        }
      });
    }

    res.status(200).json({ message: 'Evaluasi berhasil disimpan', evaluation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Ambil semua data Master Markaz
const getMarkazList = async (req, res) => {
  try {
    const markaz = await prisma.markaz.findMany({
      where: { aktif: true }
    });
    res.status(200).json({ markaz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const bcrypt = require('bcryptjs');

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params; // ini registration id
    const reg = await prisma.registration.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!reg) return res.status(404).json({ message: 'Registrasi tidak ditemukan' });

    const hashedPassword = await bcrypt.hash('mqbs2026', 10);
    await prisma.user.update({
      where: { id: reg.userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password berhasil direset menjadi mqbs2026' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');

const sendResetLink = async (req, res) => {
  try {
    const { id } = req.params; // ini user ID (admin ID)
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user || !user.email) {
      return res.status(400).json({ message: 'Admin tidak ditemukan atau tidak memiliki email' });
    }

    const secret = (process.env.JWT_SECRET || 'fallback_secret_123') + user.password;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/admin/reset-password?token=${token}&id=${user.id}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Reset Password Admin My MQ</h2>
        <p>Assalamu'alaikum, ${user.namaLengkap || 'Admin'},</p>
        <p>Superadmin telah mengirimkan link untuk mengatur ulang password akun Anda.</p>
        <p>Silakan klik tombol di bawah ini untuk mengatur ulang password Anda. Link ini hanya berlaku selama 1 jam.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Atau copy paste link berikut di browser Anda:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
        <p>Jika Anda tidak merasa perlu melakukan ini, Anda dapat mengabaikan email ini atau menghubungi superadmin.</p>
      </div>
    `;

    await sendMail(user.email, 'Reset Password Admin My MQ', htmlContent);

    res.status(200).json({ message: 'Link reset password berhasil dikirim ke email admin' });
  } catch (error) {
    console.error('Error in sendResetLink:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: {
        registrationData: true,
        examAttempts: {
          include: { answers: true, logs: true }
        },
        pembayaran: {
          include: { items: true, uangSakuMutasi: true, donasi: true }
        }
      }
    });

    if (!reg) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await prisma.$transaction(async (tx) => {
      // 1. Exam attempts
      if (reg.examAttempts && reg.examAttempts.length > 0) {
        for (const attempt of reg.examAttempts) {
          await tx.answer.deleteMany({ where: { attemptId: attempt.id } });
          await tx.proctoringLog.deleteMany({ where: { attemptId: attempt.id } });
        }
        await tx.examAttempt.deleteMany({ where: { registrationId: id } });
      }

      // 2. Pembayaran
      if (reg.pembayaran && reg.pembayaran.length > 0) {
        for (const p of reg.pembayaran) {
          await tx.pembayaranItem.deleteMany({ where: { pembayaranId: p.id } });
          await tx.uangSakuMutasi.deleteMany({ where: { pembayaranId: p.id } });
          await tx.donasi.deleteMany({ where: { pembayaranId: p.id } });
        }
        await tx.pembayaran.deleteMany({ where: { registrationId: id } });
      }

      // 3. RegistrationData
      if (reg.registrationData) {
        await tx.sibling.deleteMany({ where: { registrationDataId: reg.registrationData.id } });
        await tx.mqSibling.deleteMany({ where: { registrationDataId: reg.registrationData.id } });
        await tx.registrationData.delete({ where: { registrationId: id } });
      }

      // 4. Other relations
      await tx.document.deleteMany({ where: { registrationId: id } });
      await tx.parentInterview.deleteMany({ where: { registrationId: id } });
      await tx.interviewerEvaluation.deleteMany({ where: { registrationId: id } });
      
      // Delete surveyKunjungan if it exists (using deleteMany to not throw error if it doesn't exist)
      try {
        await tx.surveyKunjungan.deleteMany({ where: { registrationId: id } });
      } catch (e) {
        // Ignore if model doesn't exist or other relation issue
      }

      // Santri record if exists
      const santriExists = await tx.santri.findUnique({ where: { id } });
      if (santriExists) {
        throw new Error('Peserta sudah menjadi Santri aktif. Tidak dapat dihapus.');
      }

      // 5. Delete Registration
      await tx.registration.delete({ where: { id } });
      
      // 6. Delete User if CALON_WALI and no other registrations
      const otherRegs = await tx.registration.count({ where: { userId: reg.userId } });
      if (otherRegs === 0) {
        const user = await tx.user.findUnique({ where: { id: reg.userId } });
        if (user && user.role === 'CALON_WALI') {
          await tx.user.delete({ where: { id: reg.userId } });
        }
      }
    });

    res.status(200).json({ message: 'Pendaftar berhasil dihapus' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Peserta sudah menjadi Santri aktif. Tidak dapat dihapus.') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  offlineRegister,
  updateRegistrationData,
  getPpdbList,
  getPpdbDetail,
  updateDocumentStatus,
  updateSchedule,
  updateInterviewerEvaluation,
  processKelulusan,
  getAdminList,
  getAdminById,
  createAdmin,
  updateAdmin,
  updateUangMasukDeadline,
  updateUangMasukNominal,
  recordManualPayment,
  deleteAdmin,
  getPengujiList,
  checkInOffline,
  getMarkazList,
  resetUserPassword,
  deleteRegistration,
  sendResetLink
};
