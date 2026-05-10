const prisma = require('../lib/prisma');

const getTahunAjaran = async (req, res) => {
  try {
    const data = await prisma.financeTahunAjaran.findMany({
      include: {
        periodes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPublicTahunAjaran = async (req, res) => {
  try {
    const data = await prisma.financeTahunAjaran.findMany({
      where: { aktif: true },
      orderBy: { createdAt: 'desc' }
    });
    // If no active found, return all so the dropdown isn't empty
    if (data.length === 0) {
      const allData = await prisma.financeTahunAjaran.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(allData);
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTahunAjaran = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai, aktif } = req.body;
    
    if (aktif) {
      await prisma.financeTahunAjaran.updateMany({ data: { aktif: false } });
    }

    const created = await prisma.financeTahunAjaran.create({
      data: {
        nama,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        aktif: aktif || false
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') return res.status(400).json({ message: 'Tahun ajaran sudah ada.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tanggalMulai, tanggalSelesai, aktif } = req.body;

    if (aktif) {
      await prisma.financeTahunAjaran.updateMany({ data: { aktif: false } });
    }

    const updated = await prisma.financeTahunAjaran.update({
      where: { id },
      data: {
        nama,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        aktif
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.financeTahunAjaran.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPeriode = async (req, res) => {
  try {
    const { id: tahunAjaranId } = req.params;
    const { nama, tanggalMulai, tanggalSelesai, program, uangPangkal, spp } = req.body;

    const created = await prisma.financePeriodePendaftaran.create({
      data: {
        tahunAjaranId,
        nama,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        program,
        uangPangkal: Number(uangPangkal),
        spp: Number(spp)
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') return res.status(400).json({ message: 'Periode dengan program tersebut sudah ada di tahun ajaran ini.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePeriode = async (req, res) => {
  try {
    const { periodeId } = req.params;
    const { nama, tanggalMulai, tanggalSelesai, program, uangPangkal, spp } = req.body;

    const updated = await prisma.financePeriodePendaftaran.update({
      where: { id: periodeId },
      data: {
        nama,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        program,
        uangPangkal: Number(uangPangkal),
        spp: Number(spp)
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePeriode = async (req, res) => {
  try {
    const { periodeId } = req.params;
    await prisma.financePeriodePendaftaran.delete({ where: { id: periodeId } });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const calculateBiaya = async (req, res) => {
  try {
    const { academicYear, program, date } = req.query;
    if (!academicYear || !program || !date) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const targetDate = new Date(date);

    // Find the TA
    let ta = await prisma.financeTahunAjaran.findFirst({
      where: { nama: academicYear }
    });

    if (!ta) {
      // Fallback to active TA if exact match not found
      ta = await prisma.financeTahunAjaran.findFirst({
        where: { aktif: true }
      });
    }

    if (!ta) {
      return res.status(404).json({ message: 'Tahun ajaran tidak ditemukan dalam pengaturan keuangan' });
    }

    // Find the periode matching the date and program
    const periode = await prisma.financePeriodePendaftaran.findFirst({
      where: {
        tahunAjaranId: ta.id,
        program: program,
        tanggalMulai: { lte: targetDate },
        tanggalSelesai: { gte: targetDate }
      }
    });

    if (periode) {
      return res.status(200).json({ 
        uangPangkal: Number(periode.uangPangkal), 
        spp: Number(periode.spp),
        namaPeriode: periode.nama
      });
    }

    // Fallback if no matching periode, find a fallback (e.g. without date restriction or latest one)
    const fallbackPeriode = await prisma.financePeriodePendaftaran.findFirst({
      where: { tahunAjaranId: ta.id, program: program },
      orderBy: { tanggalMulai: 'desc' }
    });

    if (fallbackPeriode) {
      return res.status(200).json({ 
        uangPangkal: Number(fallbackPeriode.uangPangkal), 
        spp: Number(fallbackPeriode.spp),
        namaPeriode: fallbackPeriode.nama + " (Fallback)"
      });
    }

    return res.status(404).json({ message: 'Tidak ada periode pengaturan keuangan untuk program ini' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getTahunAjaran,
  getPublicTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  createPeriode,
  updatePeriode,
  deletePeriode,
  calculateBiaya
};
