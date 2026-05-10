const prisma = require('../lib/prisma');

const getSantriHealthRecords = async (req, res) => {
  try {
    const { santriId } = req.params;
    const records = await prisma.healthRecord.findMany({
      where: { santriId },
      orderBy: { date: 'desc' }
    });
    
    // get santri name
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      include: { registration: { select: { namaLengkap: true } } }
    });

    res.status(200).json({ records, santri: { id: santri.id, name: santri.registration?.namaLengkap } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createHealthRecord = async (req, res) => {
  try {
    const { santriId } = req.params;
    const { type, date, title, description, handledBy } = req.body;

    const record = await prisma.healthRecord.create({
      data: {
        santriId,
        type,
        date: date ? new Date(date) : undefined,
        title,
        description,
        handledBy
      }
    });

    res.status(201).json({ message: 'Riwayat kesehatan berhasil ditambahkan', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, title, description, handledBy } = req.body;

    const record = await prisma.healthRecord.update({
      where: { id },
      data: {
        type,
        date: date ? new Date(date) : undefined,
        title,
        description,
        handledBy
      }
    });

    res.status(200).json({ message: 'Riwayat kesehatan berhasil diperbarui', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.healthRecord.delete({ where: { id } });
    res.status(200).json({ message: 'Riwayat kesehatan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllSantri = async (req, res) => {
  try {
    const santriList = await prisma.santri.findMany({
      include: {
        registration: {
          select: {
            namaLengkap: true,
            jenisKelamin: true
          }
        }
      },
      where: {
        status: 'AKTIF'
      }
    });
    res.status(200).json({ santri: santriList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllSantri,
  getSantriHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
};
