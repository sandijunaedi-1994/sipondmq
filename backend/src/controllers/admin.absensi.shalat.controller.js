const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

const WAKTU_ORDER = ['SUBUH', 'DZUHUR', 'ASHAR', 'MAGHRIB', 'ISYA'];

// Koordinat pesantren — bisa override via env
const LAT  = process.env.PRAYER_LAT  || '-6.9';
const LNG  = process.env.PRAYER_LNG  || '107.6';
const METHOD = process.env.PRAYER_METHOD || '20'; // 20 = Kemenag RI

/**
 * Fetch jadwal shalat dari API aladhan.com (format DD-MM-YYYY)
 */
function fetchPrayerTimesFromApi(tanggal) {
  return new Promise((resolve, reject) => {
    const [y, m, d] = tanggal.split('-');
    const dateStr = `${d}-${m}-${y}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${LAT}&longitude=${LNG}&method=${METHOD}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.code === 200) {
            const t = json.data.timings;
            // API returns HH:MM format, strip seconds if any
            resolve({
              subuh:   t.Fajr.slice(0, 5),
              dzuhur:  t.Dhuhr.slice(0, 5),
              ashar:   t.Asr.slice(0, 5),
              maghrib: t.Maghrib.slice(0, 5),
              isya:    t.Isha.slice(0, 5),
            });
          } else {
            reject(new Error('API error: ' + json.status));
          }
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

/**
 * GET /api/admin/absensi/shalat/jadwal?tanggal=YYYY-MM-DD
 * Return jadwal shalat hari itu (ambil dari cache DB atau fetch API)
 * + status check-in musyrif jika pegawaiId diberikan
 */
const getJadwalShalat = async (req, res) => {
  try {
    const { tanggal, pegawaiId } = req.query;
    if (!tanggal) return res.status(400).json({ message: 'Tanggal wajib' });

    const tanggalDate = new Date(tanggal);

    // Coba ambil dari cache DB
    let jadwal = await prisma.jadwalShalat.findUnique({ where: { tanggal: tanggalDate } });

    if (!jadwal) {
      // Fetch dari API lalu simpan
      try {
        const times = await fetchPrayerTimesFromApi(tanggal);
        jadwal = await prisma.jadwalShalat.create({
          data: { tanggal: tanggalDate, sumber: 'API', ...times }
        });
      } catch (apiErr) {
        console.error('Prayer API error:', apiErr.message);
        return res.status(503).json({ message: 'Gagal ambil jadwal shalat dari API. Coba lagi.' });
      }
    }

    // Hitung status tiap waktu shalat
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const waktuMap = {
      SUBUH: jadwal.subuh,
      DZUHUR: jadwal.dzuhur,
      ASHAR: jadwal.ashar,
      MAGHRIB: jadwal.maghrib,
      ISYA: jadwal.isya,
    };

    // Ambil semua check-in musyrif hari ini jika pegawaiId ada
    let checkInMap = {};
    if (pegawaiId) {
      const checkIns = await prisma.musyrifCheckInShalat.findMany({
        where: { musyrifId: pegawaiId, tanggal: tanggalDate }
      });
      checkIns.forEach(c => { checkInMap[c.waktu] = c; });
    }

    // Hitung jumlah absensi yang sudah diisi per waktu shalat
    const absensiCount = await prisma.absensiShalat.groupBy({
      by: ['waktu'],
      where: { tanggal: tanggalDate },
      _count: { id: true }
    });
    const absensiMap = {};
    absensiCount.forEach(a => { absensiMap[a.waktu] = a._count.id; });

    const isToday = tanggal === new Date().toISOString().slice(0, 10);

    const result = WAKTU_ORDER.map(waktu => {
      const jamStr = waktuMap[waktu];
      const [h, m] = jamStr.split(':').map(Number);
      const adzan = h * 60 + m;

      // Window check-in: 10 menit sebelum s/d 5 menit setelah adzan
      const windowOpen  = adzan - 10;
      const windowClose = adzan + 5;

      let windowStatus = 'BELUM_BUKA'; // sebelum window
      if (isToday) {
        if (nowMinutes >= windowClose) windowStatus = 'TUTUP';
        else if (nowMinutes >= windowOpen) windowStatus = 'BUKA';
      } else {
        // Tanggal lain (kemarin/besok) → window tidak aktif
        windowStatus = tanggal < new Date().toISOString().slice(0, 10) ? 'TUTUP' : 'BELUM_BUKA';
      }

      const checkIn = checkInMap[waktu] || null;
      const sudahDiisi = (absensiMap[waktu] || 0) > 0;

      return {
        waktu,
        jam: jamStr,
        windowOpen: `${String(Math.floor(windowOpen / 60)).padStart(2, '0')}:${String(windowOpen % 60).padStart(2, '0')}`,
        windowClose: `${String(Math.floor(windowClose / 60)).padStart(2, '0')}:${String(windowClose % 60).padStart(2, '0')}`,
        windowStatus,      // BELUM_BUKA | BUKA | TUTUP
        checkIn: checkIn ? {
          waktuCheckIn: checkIn.waktuCheckIn,
          status: checkIn.statusCheckIn
        } : null,
        sudahAbsen: sudahDiisi,
        jumlahAbsensi: absensiMap[waktu] || 0,
      };
    });

    res.json({ tanggal, jadwal: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/absensi/shalat/checkin
 * Body: { musyrifId, tanggal, waktu }
 * Validasi window waktu, simpan check-in
 */
const checkInMusyrif = async (req, res) => {
  try {
    const { musyrifId, tanggal, waktu } = req.body;
    if (!musyrifId || !tanggal || !waktu) return res.status(400).json({ message: 'Data tidak lengkap' });

    const tanggalDate = new Date(tanggal);
    const jadwal = await prisma.jadwalShalat.findUnique({ where: { tanggal: tanggalDate } });
    if (!jadwal) return res.status(404).json({ message: 'Jadwal shalat hari ini belum tersedia. Muat halaman dulu.' });

    const waktuMap = { SUBUH: jadwal.subuh, DZUHUR: jadwal.dzuhur, ASHAR: jadwal.ashar, MAGHRIB: jadwal.maghrib, ISYA: jadwal.isya };
    const jamStr = waktuMap[waktu];
    if (!jamStr) return res.status(400).json({ message: 'Waktu shalat tidak valid' });

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = jamStr.split(':').map(Number);
    const adzan = h * 60 + m;
    const windowOpen  = adzan - 10;
    const windowClose = adzan + 5;

    // Cek apakah sudah check-in sebelumnya
    const existing = await prisma.musyrifCheckInShalat.findUnique({
      where: { musyrifId_tanggal_waktu: { musyrifId, tanggal: tanggalDate, waktu } }
    });
    if (existing) return res.status(400).json({ message: 'Anda sudah check-in untuk waktu shalat ini' });

    // Toleransi: bisa check-in di luar window tapi tandai TERLAMBAT
    // Admin bisa paksa check-in dari tanggal lain (hindari block)
    const isToday = tanggal === now.toISOString().slice(0, 10);
    let statusCheckIn = 'TEPAT_WAKTU';
    if (isToday) {
      if (nowMinutes < windowOpen || nowMinutes > windowClose + 120) {
        return res.status(400).json({
          message: `Window check-in untuk ${waktu} adalah ${String(Math.floor(windowOpen/60)).padStart(2,'0')}:${String(windowOpen%60).padStart(2,'0')} - ${String(Math.floor(windowClose/60)).padStart(2,'0')}:${String(windowClose%60).padStart(2,'0')}`,
          windowOpen, windowClose, nowMinutes
        });
      }
      if (nowMinutes > windowClose) statusCheckIn = 'TERLAMBAT';
    }

    const checkIn = await prisma.musyrifCheckInShalat.create({
      data: { musyrifId, tanggal: tanggalDate, waktu, waktuCheckIn: now, statusCheckIn }
    });

    res.json({ message: 'Check-in berhasil!', statusCheckIn, checkIn });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/absensi/shalat/santri?tanggal=&waktu=
 * Return: daftar semua santri aktif + status absensi shalat mereka
 */
const getSantriShalat = async (req, res) => {
  try {
    const { tanggal, waktu } = req.query;
    if (!tanggal || !waktu) return res.status(400).json({ message: 'tanggal dan waktu wajib' });

    const tanggalDate = new Date(tanggal);

    const santriList = await prisma.santri.findMany({
      where: { status: 'AKTIF' },
      include: {
        registration: { select: { studentName: true, gender: true } },
        kelasRef: { select: { nama: true } },
        asramaRef: { select: { nama: true } },
        absensiShalat: {
          where: { tanggal: tanggalDate, waktu },
          select: { id: true, status: true, catatan: true }
        }
      },
      orderBy: { registration: { studentName: 'asc' } }
    });

    const result = santriList.map((s, idx) => {
      const absensi = s.absensiShalat[0] || null;
      return {
        no: idx + 1,
        santriId: s.id,
        nis: s.nis,
        nama: s.registration?.studentName || '-',
        gender: s.registration?.gender,
        kelas: s.kelasRef?.nama,
        asrama: s.asramaRef?.nama,
        absensi: absensi ? { id: absensi.id, status: absensi.status, catatan: absensi.catatan } : null
      };
    });

    res.json({ tanggal, waktu, santri: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/absensi/shalat
 * Body: { tanggal, waktu, pencatatId, absensi: [{ santriId, status, catatan }] }
 */
const simpanAbsensiShalat = async (req, res) => {
  try {
    const { tanggal, waktu, pencatatId, absensi } = req.body;
    if (!tanggal || !waktu || !pencatatId || !Array.isArray(absensi)) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const tanggalDate = new Date(tanggal);

    // Hapus lama, simpan baru
    await prisma.absensiShalat.deleteMany({ where: { tanggal: tanggalDate, waktu } });

    const dataToInsert = absensi
      .filter(a => a.status)
      .map(a => ({
        santriId: a.santriId,
        tanggal: tanggalDate,
        waktu,
        status: a.status,
        catatan: a.catatan || null,
        pencatatId
      }));

    if (dataToInsert.length > 0) {
      await prisma.absensiShalat.createMany({ data: dataToInsert });
    }

    res.json({ message: 'Absensi shalat berhasil disimpan', jumlahTidakHadir: dataToInsert.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJadwalShalat, checkInMusyrif, getSantriShalat, simpanAbsensiShalat };
