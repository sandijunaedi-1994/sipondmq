const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping nama hari JS ke nama hari di DB
const HARI_MAP = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * GET /api/admin/absensi/kbm/sesi
 * Query: tanggal (YYYY-MM-DD), guruId (optional)
 * - Jika guruId diberikan: tampilkan sesi guru tersebut
 * - Jika tidak: tampilkan SEMUA sesi hari itu (untuk Waka/TU/Admin)
 */
const getSesiHariIni = async (req, res) => {
  try {
    const { tanggal, guruId } = req.query;
    if (!tanggal) return res.status(400).json({ message: 'Parameter tanggal wajib diisi' });

    const date = new Date(tanggal);
    const hariIndex = date.getDay();
    const hariNama = HARI_MAP[hariIndex];

    // Build where clause
    const whereClause = {
      pengaturanJam: { hari: hariNama, aktif: true, isIstirahat: false }
    };
    if (guruId) whereClause.guruId = guruId;

    const slots = await prisma.jadwalPelajaranSlot.findMany({
      where: whereClause,
      include: {
        pengaturanJam: true,
        mapel: true,
        kelas: { include: { markaz: true } },
        guru: true,
        absensiKBM: {
          where: { tanggal: new Date(tanggal) },
          select: { id: true }
        }
      },
      orderBy: [
        { pengaturanJam: { jpKe: 'asc' } },
        { kelas: { nama: 'asc' } }
      ]
    });

    const result = slots.map(slot => ({
      id: slot.id,
      jpKe: slot.pengaturanJam.jpKe,
      jamMulai: slot.pengaturanJam.jamMulai,
      jamSelesai: slot.pengaturanJam.jamSelesai,
      mapel: { id: slot.mapel.id, nama: slot.mapel.nama, kode: slot.mapel.kode },
      kelas: { id: slot.kelas.id, nama: slot.kelas.nama, markaz: slot.kelas.markaz?.nama },
      guru: { id: slot.guru.id, namaLengkap: slot.guru.namaLengkap },
      jumlahAbsensi: slot.absensiKBM.length,
      sudahDiisi: slot.absensiKBM.length > 0,
    }));

    res.json({ hari: hariNama, tanggal, sesi: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/absensi/kbm/guru-list
 * Query: tanggal (YYYY-MM-DD)
 * Return: daftar guru yang punya jadwal di hari tersebut
 */
const getGuruList = async (req, res) => {
  try {
    const { tanggal } = req.query;
    if (!tanggal) return res.status(400).json({ message: 'Parameter tanggal wajib' });

    const hariNama = HARI_MAP[new Date(tanggal).getDay()];

    const slots = await prisma.jadwalPelajaranSlot.findMany({
      where: { pengaturanJam: { hari: hariNama, aktif: true, isIstirahat: false } },
      select: { guru: { select: { id: true, namaLengkap: true } } },
      distinct: ['guruId'],
      orderBy: { guru: { namaLengkap: 'asc' } }
    });

    res.json(slots.map(s => s.guru));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/absensi/kbm/santri
 * Query: slotId, tanggal (YYYY-MM-DD)
 * Return: daftar santri sekelas + status absensi masing-masing
 */
const getSantriBySlot = async (req, res) => {
  try {
    const { slotId, tanggal } = req.query;
    if (!slotId || !tanggal) return res.status(400).json({ message: 'slotId dan tanggal wajib diisi' });

    // Ambil slot untuk tahu kelasId
    const slot = await prisma.jadwalPelajaranSlot.findUnique({
      where: { id: slotId },
      include: { kelas: true, mapel: true, pengaturanJam: true, guru: true }
    });
    if (!slot) return res.status(404).json({ message: 'Sesi tidak ditemukan' });

    // Ambil semua santri di kelas tersebut
    const santriList = await prisma.santri.findMany({
      where: {
        kelasId: slot.kelasId,
        status: 'AKTIF'
      },
      include: {
        registration: { select: { studentName: true, gender: true } },
        absensiKBM: {
          where: { slotId, tanggal: new Date(tanggal) },
          select: { id: true, status: true, catatan: true }
        }
      },
      orderBy: { registration: { studentName: 'asc' } }
    });

    const result = santriList.map((s, idx) => {
      const absensi = s.absensiKBM[0] || null;
      return {
        no: idx + 1,
        santriId: s.id,
        nis: s.nis,
        nama: s.registration?.studentName || '-',
        gender: s.registration?.gender,
        absensi: absensi ? {
          id: absensi.id,
          status: absensi.status,
          catatan: absensi.catatan
        } : null
      };
    });

    res.json({
      slot: {
        id: slot.id,
        jpKe: slot.pengaturanJam.jpKe,
        jamMulai: slot.pengaturanJam.jamMulai,
        jamSelesai: slot.pengaturanJam.jamSelesai,
        mapel: slot.mapel.nama,
        kelas: slot.kelas.nama,
        guru: slot.guru.namaLengkap,
      },
      tanggal,
      santri: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/absensi/kbm
 * Body: { slotId, tanggal, pencatatId, absensi: [{ santriId, status, catatan }] }
 * Hanya simpan santri yang tidak hadir (status != null)
 */
const simpanAbsensiKBM = async (req, res) => {
  try {
    const { slotId, tanggal, pencatatId, absensi } = req.body;
    if (!slotId || !tanggal || !pencatatId || !Array.isArray(absensi)) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const tanggalDate = new Date(tanggal);

    // Validasi slot ada
    const slot = await prisma.jadwalPelajaranSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ message: 'Sesi tidak ditemukan' });

    // Hapus dulu absensi lama untuk sesi & tanggal ini (replace strategy)
    await prisma.absensiKBM.deleteMany({
      where: { slotId, tanggal: tanggalDate }
    });

    // Simpan yang baru (hanya yang tidak hadir)
    const dataToInsert = absensi
      .filter(a => a.status) // hanya yang punya status (tidak hadir)
      .map(a => ({
        slotId,
        tanggal: tanggalDate,
        santriId: a.santriId,
        status: a.status,
        catatan: a.catatan || null,
        pencatatId
      }));

    if (dataToInsert.length > 0) {
      await prisma.absensiKBM.createMany({ data: dataToInsert });
    }

    res.json({
      message: 'Absensi berhasil disimpan',
      jumlahTidakHadir: dataToInsert.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/absensi/kbm/rekap
 * Query: tanggal, kelasId (optional), slotId (optional)
 */
const getRekapAbsensiKBM = async (req, res) => {
  try {
    const { tanggal, kelasId, slotId } = req.query;
    if (!tanggal) return res.status(400).json({ message: 'Parameter tanggal wajib' });

    const where = { tanggal: new Date(tanggal) };
    if (slotId) where.slotId = slotId;
    if (kelasId) where.slot = { kelasId: parseInt(kelasId) };

    const rekap = await prisma.absensiKBM.findMany({
      where,
      include: {
        santri: {
          include: { registration: { select: { studentName: true } }, kelasRef: true }
        },
        slot: {
          include: { mapel: true, kelas: true, pengaturanJam: true }
        },
        pencatat: { select: { namaLengkap: true } }
      },
      orderBy: [{ slot: { pengaturanJam: { jpKe: 'asc' } } }, { santri: { registration: { studentName: 'asc' } } }]
    });

    res.json(rekap.map(r => ({
      id: r.id,
      tanggal: r.tanggal,
      santri: { id: r.santriId, nama: r.santri.registration?.studentName, kelas: r.santri.kelasRef?.nama },
      sesi: {
        jp: r.slot.pengaturanJam.jpKe,
        jam: `${r.slot.pengaturanJam.jamMulai} - ${r.slot.pengaturanJam.jamSelesai}`,
        mapel: r.slot.mapel.nama,
        kelas: r.slot.kelas.nama
      },
      status: r.status,
      catatan: r.catatan,
      pencatat: r.pencatat.namaLengkap
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSesiHariIni, getSantriBySlot, simpanAbsensiKBM, getRekapAbsensiKBM, getGuruList };
