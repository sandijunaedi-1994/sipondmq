const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// MATA PELAJARAN
// ==========================================
const getMapel = async (req, res) => {
  try {
    const mapels = await prisma.mataPelajaran.findMany({
      orderBy: { nama: 'asc' }
    });
    res.json(mapels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMapel = async (req, res) => {
  try {
    const { kode, nama, kategori } = req.body;
    const mapel = await prisma.mataPelajaran.create({
      data: { kode, nama, kategori }
    });
    res.json(mapel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMapel = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, kategori, aktif } = req.body;
    const mapel = await prisma.mataPelajaran.update({
      where: { id },
      data: { kode, nama, kategori, aktif }
    });
    res.json(mapel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMapel = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mataPelajaran.delete({ where: { id } });
    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PENGATURAN JAM
// ==========================================
const getJam = async (req, res) => {
  try {
    const jams = await prisma.jadwalPengaturanJam.findMany({
      orderBy: [
        { hari: 'asc' },
        { jpKe: 'asc' }
      ]
    });
    res.json(jams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createJam = async (req, res) => {
  try {
    const { hari, jpKe, jamMulai, jamSelesai, isIstirahat } = req.body;
    const jam = await prisma.jadwalPengaturanJam.create({
      data: { hari, jpKe: parseInt(jpKe), jamMulai, jamSelesai, isIstirahat }
    });
    res.json(jam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJam = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jadwalPengaturanJam.delete({ where: { id } });
    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PLOTTING (GURU - MAPEL - KELAS)
// ==========================================
const getPlotting = async (req, res) => {
  try {
    const plots = await prisma.jadwalAturanPlotting.findMany({
      include: {
        mapel: true,
        guru: true,
        kelas: true
      }
    });
    res.json(plots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPlotting = async (req, res) => {
  try {
    const { mapelId, guruId, kelasId, formatPecahan } = req.body;
    
    // Hitung total JP otomatis dari format pecahan
    const blockSizes = (formatPecahan || "1").split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const totalJpMingguan = blockSizes.reduce((sum, n) => sum + n, 0);

    const plot = await prisma.jadwalAturanPlotting.create({
      data: {
        mapelId,
        guruId,
        kelasId: parseInt(kelasId),
        totalJpMingguan,
        formatPecahan: formatPecahan || "1"
      },
      include: { mapel: true, guru: true, kelas: true }
    });
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlotting = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jadwalAturanPlotting.delete({ where: { id } });
    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// JADWAL HASIL GENERATE
// ==========================================
const getJadwal = async (req, res) => {
  try {
    const slots = await prisma.jadwalPelajaranSlot.findMany({
      include: {
        pengaturanJam: true,
        mapel: true,
        guru: true,
        kelas: true
      }
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ALGORITMA GENERATE JADWAL
// ==========================================
const generateJadwal = async (req, res) => {
  try {
    // 1. Ambil dependensi
    const plottings = await prisma.jadwalAturanPlotting.findMany({
      include: { guru: true, kelas: true, mapel: true }
    });
    const jams = await prisma.jadwalPengaturanJam.findMany({
      where: { aktif: true, isIstirahat: false },
      orderBy: [{ hari: 'asc' }, { jpKe: 'asc' }]
    });

    if (plottings.length === 0 || jams.length === 0) {
      return res.status(400).json({ message: "Aturan plotting atau pengaturan jam kosong. Harap isi terlebih dahulu." });
    }

    // 2. Bersihkan jadwal lama
    await prisma.jadwalPelajaranSlot.deleteMany();

    // 3. Grid ketersediaan (availability)
    // grid[hari][jpKe] = { jamId, kelasUsed: Set(), guruUsed: Set() }
    const grid = {};
    for (const jam of jams) {
      if (!grid[jam.hari]) grid[jam.hari] = {};
      grid[jam.hari][jam.jpKe] = { 
        jamId: jam.id,
        kelasUsed: new Set(),
        guruUsed: new Set()
      };
    }

    const slotsToInsert = [];

    // Prioritaskan guru yang mengajarnya banyak (Hardest constraints first)
    plottings.sort((a, b) => b.totalJpMingguan - a.totalJpMingguan);

    // Loop masing-masing plot
    for (const plot of plottings) {
      const blockSizes = plot.formatPecahan.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const days = Object.keys(grid);
      let dayIndex = 0;

      // Track days already used by this plot to distribute blocks to different days if possible
      const usedDays = new Set();
      
      for (const blockSize of blockSizes) {
        let placedThisBlock = false;
        
        for (let i = 0; i < days.length; i++) {
          const day = days[(dayIndex + i) % days.length];
          if (usedDays.has(day)) continue; // Try to use a different day first

          const dailyJams = Object.values(grid[day]);
          
          // Cari urutan blok kosong di hari ini yang panjangnya memenuhi blockSize
          let foundStartIndex = -1;
          for (let j = 0; j <= dailyJams.length - blockSize; j++) {
            let canFit = true;
            for (let k = 0; k < blockSize; k++) {
              const jam = dailyJams[j + k];
              if (jam.kelasUsed.has(plot.kelasId) || jam.guruUsed.has(plot.guruId)) {
                canFit = false;
                break;
              }
            }
            if (canFit) {
              foundStartIndex = j;
              break;
            }
          }

          if (foundStartIndex !== -1) {
            // Plot blok ini!
            for (let k = 0; k < blockSize; k++) {
              const jam = dailyJams[foundStartIndex + k];
              jam.kelasUsed.add(plot.kelasId);
              jam.guruUsed.add(plot.guruId);
              
              slotsToInsert.push({
                pengaturanJamId: jam.jamId,
                mapelId: plot.mapelId,
                guruId: plot.guruId,
                kelasId: plot.kelasId
              });
            }
            usedDays.add(day);
            placedThisBlock = true;
            dayIndex = (dayIndex + i + 1) % days.length; // Mulai cari dari hari berikutnya
            break;
          }
        }
        
        // Jika tidak bisa diletakkan di hari yang berbeda, coba abaikan usedDays
        if (!placedThisBlock) {
          for (let i = 0; i < days.length; i++) {
            const day = days[(dayIndex + i) % days.length];
            const dailyJams = Object.values(grid[day]);
            
            let foundStartIndex = -1;
            for (let j = 0; j <= dailyJams.length - blockSize; j++) {
              let canFit = true;
              for (let k = 0; k < blockSize; k++) {
                const jam = dailyJams[j + k];
                if (jam.kelasUsed.has(plot.kelasId) || jam.guruUsed.has(plot.guruId)) {
                  canFit = false;
                  break;
                }
              }
              if (canFit) {
                foundStartIndex = j;
                break;
              }
            }
  
            if (foundStartIndex !== -1) {
              // Plot blok ini!
              for (let k = 0; k < blockSize; k++) {
                const jam = dailyJams[foundStartIndex + k];
                jam.kelasUsed.add(plot.kelasId);
                jam.guruUsed.add(plot.guruId);
                
                slotsToInsert.push({
                  pengaturanJamId: jam.jamId,
                  mapelId: plot.mapelId,
                  guruId: plot.guruId,
                  kelasId: plot.kelasId
                });
              }
              placedThisBlock = true;
              dayIndex = (dayIndex + i + 1) % days.length;
              break;
            }
          }
        }

        if (!placedThisBlock) {
          console.warn(`Gagal memplot mapel ${plot.mapelId} untuk kelas ${plot.kelasId} blok ukuran ${blockSize}`);
        }
      }
    }

    // 4. Simpan hasil ke database
    if (slotsToInsert.length > 0) {
      await prisma.jadwalPelajaranSlot.createMany({
        data: slotsToInsert
      });
    }

    res.json({ message: "Jadwal berhasil digenerate!", totalSlots: slotsToInsert.length });
  } catch (error) {
    console.error("Error generating jadwal:", error);
    res.status(500).json({ message: "Terjadi kesalahan algoritma penjadwalan", error: error.message });
  }
};

module.exports = {
  getMapel, createMapel, updateMapel, deleteMapel,
  getJam, createJam, deleteJam,
  getPlotting, createPlotting, deletePlotting,
  getJadwal, generateJadwal
};
