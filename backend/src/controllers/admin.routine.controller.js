const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const getRoutineTasks = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isSuperAdmin = currentUser?.permissions?.includes('MANAJEMEN_ADMIN');
    
    let whereClause = {};
    if (!isSuperAdmin) {
      // Only show tasks created by this user OR assigned to them by name
      whereClause = {
        OR: [
          { creatorId: req.user.userId },
          ...(currentUser?.namaLengkap ? [{ petugas: { contains: currentUser.namaLengkap } }] : [])
        ]
      };
    }

    const tasks = await prisma.mcRoutineTask.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createRoutineTask = async (req, res) => {
  try {
    const { aktivitas, frekuensi, jamMulai, jamSelesai, petugas, deskripsi } = req.body;
    
    const task = await prisma.mcRoutineTask.create({
      data: {
        id: uuidv4(),
        aktivitas,
        frekuensi,
        jamMulai,
        jamSelesai,
        petugas,
        deskripsi,
        creatorId: req.user.userId,
        updatedAt: new Date()
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'McRoutineTask',
      details: `Membuat aktivitas rutin: ${aktivitas}`,
      req
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRoutineTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { aktivitas, frekuensi, jamMulai, jamSelesai, petugas, deskripsi } = req.body;
    
    // Cek apakah task ada
    const existing = await prisma.mcRoutineTask.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Aktivitas rutin tidak ditemukan' });

    // Cek izin: hanya creator atau superadmin yang boleh edit
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isSuperAdmin = currentUser?.permissions?.includes('MANAJEMEN_ADMIN');
    if (!isSuperAdmin && existing.creatorId !== req.user.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit aktivitas ini' });
    }

    const task = await prisma.mcRoutineTask.update({
      where: { id },
      data: {
        aktivitas,
        frekuensi,
        jamMulai: jamMulai || null,
        jamSelesai: jamSelesai || null,
        petugas,
        deskripsi: deskripsi || null,
        updatedAt: new Date()
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'McRoutineTask',
      details: `Mengedit aktivitas rutin: ${aktivitas}`,
      req
    });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRoutineTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hapus schedules terkait
    await prisma.mcRoutineSchedule.deleteMany({
      where: { routineTaskId: id }
    });

    const task = await prisma.mcRoutineTask.delete({
      where: { id }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'McRoutineTask',
      details: `Menghapus aktivitas rutin: ${task.aktivitas}`,
      req
    });

    res.status(200).json({ message: 'Berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- SCHEDULES ---
const getRoutineSchedules = async (req, res) => {
  try {
    const { month, year, petugas } = req.query;
    
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isSuperAdmin = currentUser?.permissions?.includes('MANAJEMEN_ADMIN');
    
    let whereClause = {};
    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);
      whereClause.taskDate = {
        gte: startDate,
        lte: endDate
      };
    }
    
    if (petugas) {
      whereClause.petugas = petugas;
    } else if (!isSuperAdmin && currentUser) {
      // Hanya tampilkan schedule milik user ini
      whereClause.petugas = { contains: currentUser.namaLengkap };
    }

    const schedules = await prisma.mcRoutineSchedule.findMany({
      where: whereClause,
      include: {
        McRoutineTask: true
      },
      orderBy: { taskDate: 'asc' }
    });
    
    // Ambil UserTask (Tugas Atasan & Inisiatif)
    let utWhereClause = {};
    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);
      utWhereClause.dueDate = {
        gte: startDate,
        lte: endDate
      };
    }
    
    if (!isSuperAdmin) {
      // Filter tugas atasan/inisiatif hanya yang ditugaskan ke user ini
      utWhereClause.assigneeId = req.user.userId;
    }
    
    const userTasksRaw = await prisma.userTask.findMany({
      where: utWhereClause,
      include: {
        assignee: { select: { namaLengkap: true } },
        assigner: { select: { namaLengkap: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Map UserTask agar kompatibel dengan frontend yang membaca bentuk McRoutineSchedule
    const userTasksMapped = userTasksRaw.map(ut => ({
      id: ut.id,
      taskDate: ut.dueDate,
      petugas: ut.assignee?.namaLengkap || 'Sistem',
      status: ut.status,
      isUserTask: true, // penanda
      McRoutineTask: {
        id: ut.id,
        aktivitas: ut.title,
        frekuensi: ut.taskType,
        jamMulai: null,
        jamSelesai: null,
        petugas: ut.assignee?.namaLengkap,
        deskripsi: ut.description
      }
    }));

    // Gabungkan
    const allSchedules = [...schedules, ...userTasksMapped].sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate));
    
    res.status(200).json(allSchedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRoutineScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const schedule = await prisma.mcRoutineSchedule.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        McRoutineTask: true
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'McRoutineSchedule',
      details: `Mengubah status jadwal "${schedule.McRoutineTask.aktivitas}" menjadi ${status}`,
      req
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate schedules based on frequency
const generateSchedules = async (req, res) => {
  try {
    const { month, year } = req.body; // 1-12
    const y = parseInt(year);
    const m = parseInt(month) - 1; // 0-11
    
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isSuperAdmin = currentUser?.permissions?.includes('MANAJEMEN_ADMIN');
    
    let whereClause = {};
    if (!isSuperAdmin) {
      whereClause = {
        petugas: { contains: currentUser.namaLengkap }
      };
    }
    
    const tasks = await prisma.mcRoutineTask.findMany({
      where: whereClause
    });
    
    // Generate untuk 1 pekan ke depan saja, mulai dari hari ini
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    let createdCount = 0;

    for (const task of tasks) {
      const { frekuensi, petugas, id: routineTaskId } = task;
      const freqUpper = frekuensi.toUpperCase();
      
      let datesToGenerate = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday
        // Set to 12:00 PM local time to prevent UTC date shifting backward in Prisma
        const currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
        
        let shouldGenerate = false;
        
        if (freqUpper === 'HARIAN' || freqUpper === 'SETIAP HARI' || freqUpper === 'DAILY') {
          // Lewatkan hari Minggu (0) untuk rutinitas harian
          if (dayOfWeek !== 0) {
            shouldGenerate = true;
          }
        } 
        else if (freqUpper.startsWith('PEKANAN')) {
          if (freqUpper.includes('SENIN') && dayOfWeek === 1) shouldGenerate = true;
          else if (freqUpper.includes('SELASA') && dayOfWeek === 2) shouldGenerate = true;
          else if (freqUpper.includes('RABU') && dayOfWeek === 3) shouldGenerate = true;
          else if (freqUpper.includes('KAMIS') && dayOfWeek === 4) shouldGenerate = true;
          else if ((freqUpper.includes('JUMAT') || freqUpper.includes("JUM'AT")) && dayOfWeek === 5) shouldGenerate = true;
          else if (freqUpper.includes('SABTU') && dayOfWeek === 6) shouldGenerate = true;
          else if (freqUpper.includes('MINGGU') && dayOfWeek === 0) shouldGenerate = true;
          else if (freqUpper.includes('TIDAK TERTENTU') && dayOfWeek === 1) {
            // Default ke hari Senin untuk pekanan tidak tertentu
            shouldGenerate = true;
          }
        }
        else if (freqUpper === 'BULANAN') {
          if (currentDate.getDate() === 1) shouldGenerate = true;
        }
        else if (freqUpper === 'SEMESTERAN') {
          if (currentDate.getDate() === 1 && (currentDate.getMonth() === 0 || currentDate.getMonth() === 6)) {
            shouldGenerate = true;
          }
        }
        else if (freqUpper === 'TAHUNAN') {
          if (currentDate.getDate() === 1 && currentDate.getMonth() === 0) {
            shouldGenerate = true;
          }
        }

        if (shouldGenerate) {
          // Check if already exists to prevent duplicates (using range to avoid timezone mismatch)
          const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
          const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
          
          const exists = await prisma.mcRoutineSchedule.findFirst({
            where: {
              routineTaskId,
              taskDate: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          });
          
          if (!exists) {
            datesToGenerate.push(currentDate);
          }
        }
      }
      
      if (datesToGenerate.length > 0) {
        await prisma.mcRoutineSchedule.createMany({
          data: datesToGenerate.map(date => ({
            id: uuidv4(),
            routineTaskId,
            taskDate: date,
            petugas: petugas || '-',
            status: 'PENDING',
            updatedAt: new Date()
          }))
        });
        createdCount += datesToGenerate.length;
      }
    }

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'McRoutineSchedule',
      details: `Men-generate ${createdCount} jadwal rutin untuk bulan ${month}/${year}`,
      req
    });

    res.status(200).json({ message: `Berhasil men-generate ${createdCount} jadwal` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- AD-HOC ACTIVITY ---
// 1. Tambah dari Aktivitas Rutin
const addAdhocRoutine = async (req, res) => {
  try {
    const { routineTaskId, taskDate, petugas } = req.body;
    
    const task = await prisma.mcRoutineTask.findUnique({ where: { id: routineTaskId } });
    if (!task) return res.status(404).json({ message: 'Aktivitas rutin tidak ditemukan' });

    const newSchedule = await prisma.mcRoutineSchedule.create({
      data: {
        id: require('uuid').v4(),
        routineTaskId,
        taskDate: new Date(taskDate),
        petugas: petugas || task.petugas || 'Sistem',
        status: 'PENDING',
        updatedAt: new Date()
      }
    });
    
    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'McRoutineSchedule',
      details: `Menambahkan aktivitas rutin ad-hoc: ${task.aktivitas}`,
      req
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. Tambah Inisiatif (UserTask)
const addInitiativeTask = async (req, res) => {
  try {
    const { title, description, taskDate } = req.body;
    
    const newTask = await prisma.userTask.create({
      data: {
        title,
        description,
        taskType: 'INISIATIF',
        dueDate: new Date(taskDate),
        assigneeId: req.user.userId,
        status: 'PENDING'
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'UserTask',
      details: `Membuat aktivitas inisiatif: ${title}`,
      req
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- DASHBOARD TASKS ---
const getDashboardTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    // 1. Ambil UserTask (Inisiatif / Tugas Atasan) yang dueDate-nya dari 3 hari lalu sampai hari ini
    const userTasksRaw = await prisma.userTask.findMany({
      where: {
        assigneeId: req.user.userId,
        dueDate: { 
          gte: threeDaysAgo,
          lte: today 
        }
      },
      include: {
        assigner: { select: { namaLengkap: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const userTasksMapped = userTasksRaw.map(ut => ({
      id: ut.id,
      taskDate: ut.dueDate,
      petugas: user.namaLengkap,
      status: ut.status,
      isUserTask: true,
      McRoutineTask: {
        id: ut.id,
        aktivitas: ut.title,
        frekuensi: ut.taskType,
        jamMulai: null,
        jamSelesai: null,
        petugas: user.namaLengkap,
        deskripsi: ut.description
      }
    }));

    // 2. Ambil McRoutineSchedule yang petugasnya sama dengan user dan taskDate dari 3 hari lalu sampai hari ini
    const schedules = await prisma.mcRoutineSchedule.findMany({
      where: {
        petugas: { contains: user.namaLengkap },
        taskDate: { 
          gte: threeDaysAgo,
          lte: today 
        }
      },
      include: {
        McRoutineTask: true
      },
      orderBy: { taskDate: 'asc' }
    });

    // Karena user mungkin ingin lihat hari ini dan yang belum selesai dari kemarin:
    // kita filter: kalau taskDate < hari ini, tampilkan hanya yang PENDING.
    // Kalau taskDate == hari ini, tampilkan semua (PENDING & SELESAI).
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const allTasks = [...schedules, ...userTasksMapped].filter(t => {
      const taskDate = new Date(t.taskDate);
      if (taskDate < startOfToday) {
        return t.status !== 'SELESAI'; // Tampilkan overdue hanya yang belum selesai
      }
      return true; // Tampilkan semua yang hari ini
    }).sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate));

    res.status(200).json(allTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const task = await prisma.userTask.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });

    const updatedTask = await prisma.userTask.update({
      where: { id },
      data: { status }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'UserTask',
      details: `Mengubah status inisiatif "${task.title}" menjadi ${status}`,
      req
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getRoutineTasks,
  createRoutineTask,
  updateRoutineTask,
  deleteRoutineTask,
  getRoutineSchedules,
  updateRoutineScheduleStatus,
  generateSchedules,
  addAdhocRoutine,
  addInitiativeTask,
  getDashboardTasks,
  updateUserTaskStatus
};
