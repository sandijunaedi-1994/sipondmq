const prisma = require('../lib/prisma');

const submitRegistration = async (req, res) => {
  try {
    const { studentName, academicYear, program, gender, previousSchool, source, motivation } = req.body;
    const userId = req.user.userId;

    // Diperbolehkan mendaftarkan lebih dari satu santri

    let markazKode = null;
    if (gender === 'PEREMPUAN') {
      markazKode = 'MQBS3';
    } else if (program === 'SMP' && gender === 'LAKI_LAKI') {
      markazKode = 'MQBS1';
    } else if (program === 'SMA' && gender === 'LAKI_LAKI') {
      markazKode = 'MQBS2';
    }

    let markazId = null;
    if (markazKode) {
      const markaz = await prisma.markaz.findUnique({ where: { kode: markazKode } });
      if (markaz) {
        markazId = markaz.id;
      }
    }

    const registration = await prisma.registration.create({
      data: {
        userId,
        studentName,
        academicYear,
        program,
        gender,
        previousSchool,
        source,
        motivation,
        status: 'PEMBAYARAN_REGISTRASI',
        markazId
      }
    });

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const registrations = await prisma.registration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        documents: true,
        parentInterview: true,
        user: true,
        registrationData: true,
        pembayaran: true,
        examAttempts: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!registrations || registrations.length === 0) {
      return res.status(200).json({ registrations: [] });
    }

    res.status(200).json({ registrations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitKelengkapanData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;
    const { registrationId, ...registrationDataParamsRaw } = data;

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status !== 'KELENGKAPAN_DATA' && registration.status !== 'PEMBAYARAN_REGISTRASI') {
      return res.status(400).json({ message: 'Invalid registration status for this action' });
    }

    const { siblings, mqSiblings, ...registrationDataParams } = registrationDataParamsRaw;

    // Create Registration Data
    await prisma.registrationData.upsert({
      where: { registrationId: registration.id },
      update: {
        ...registrationDataParams,
        siblings: {
          deleteMany: {},
          create: siblings || []
        },
        mqSiblings: {
          deleteMany: {},
          create: mqSiblings || []
        }
      },
      create: {
        registrationId: registration.id,
        ...registrationDataParams,
        siblings: {
          create: siblings || []
        },
        mqSiblings: {
          create: mqSiblings || []
        }
      }
    });

    // Update Registration Status
    const regPayment = await prisma.pembayaran.findFirst({
      where: { registrationId: registration.id, status: 'LUNAS' }
    });
    const newStatus = regPayment ? 'TES_WAWANCARA' : 'KELENGKAPAN_DATA';

    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: newStatus }
    });

    res.status(200).json({ message: 'Data kelengkapan berhasil disimpan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const proceedDaftarUlang = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { registrationId } = req.body;

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status !== 'PENGUMUMAN') {
      return res.status(400).json({ message: 'Status pendaftaran tidak valid untuk proses ini.' });
    }

    // TODO: Validate if the student actually passed. For now, we trust the client request.
    
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'DAFTAR_ULANG' }
    });

    res.status(200).json({ message: 'Berhasil lanjut ke tahap Daftar Ulang.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPreviousFamilyData = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get all registrations for this user that have registrationData filled
    const previousRegistrations = await prisma.registration.findMany({
      where: { 
        userId,
        registrationData: { isNot: null }
      },
      include: {
        registrationData: {
          include: {
            siblings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!previousRegistrations || previousRegistrations.length === 0) {
      return res.status(200).json({ parents: null, siblings: [] });
    }

    // Ambil data orang tua dari pendaftaran terakhir yang terisi
    const lastData = previousRegistrations[0].registrationData;
    const parents = {
      fatherName: lastData.fatherName || "",
      fatherAge: lastData.fatherAge || "",
      fatherEducation: lastData.fatherEducation || "",
      fatherOccupation: lastData.fatherOccupation || "",
      fatherIncome: lastData.fatherIncome || "",
      fatherAddress: lastData.fatherAddress || "",
      motherName: lastData.motherName || "",
      motherAge: lastData.motherAge || "",
      motherEducation: lastData.motherEducation || "",
      motherOccupation: lastData.motherOccupation || "",
      motherIncome: lastData.motherIncome || "",
      motherAddress: lastData.motherAddress || "",
      parentStatus: lastData.parentStatus || "BERSAMA"
    };

    // Gabungkan semua saudara kandung dari riwayat pendaftaran
    let allSiblings = [];
    previousRegistrations.forEach(reg => {
      if (reg.registrationData && reg.registrationData.siblings) {
        allSiblings = [...allSiblings, ...reg.registrationData.siblings];
      }
    });

    // Remove duplicates based on name and age
    const uniqueSiblings = [];
    allSiblings.forEach(sib => {
      const exists = uniqueSiblings.find(u => u.name === sib.name && u.age === sib.age);
      if (!exists) {
        uniqueSiblings.push(sib);
      }
    });

    res.status(200).json({ parents, siblings: uniqueSiblings });
  } catch (error) {
    console.error("Error getPreviousFamilyData:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitSurvey = async (req, res) => {
  try {
    const { namaSantri, noHp, tanggal, jam, program, gender, harapan } = req.body;

    // Validate inputs
    if (!namaSantri || !noHp || !tanggal || !jam || !program || !gender || !harapan) {
      return res.status(400).json({ message: 'Harap lengkapi semua data survei' });
    }

    const survey = await prisma.surveyKunjungan.create({
      data: {
        namaSantri,
        noHp,
        tanggal: new Date(tanggal),
        jam,
        program,
        gender: gender === "Laki-laki" ? "LAKI_LAKI" : "PEREMPUAN",
        harapan
      }
    });

    res.status(201).json({ message: 'Jadwal survei berhasil dibuat', survey });
  } catch (error) {
    console.error("Error submitSurvey:", error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan jadwal survei' });
  }
};

module.exports = { submitRegistration, getRegistrationStatus, submitKelengkapanData, proceedDaftarUlang, getPreviousFamilyData, submitSurvey };
