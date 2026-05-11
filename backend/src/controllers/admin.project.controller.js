const prisma = require('../lib/prisma');
const crypto = require('crypto');

// Get all projects (Daftar Tugas)
exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.mcDaftarTugas.findMany({
      include: {
        McBudget: true,
        McSubTugas: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data project' });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { 
      rencanaPekerjaan, kategori, status, prioritas, sumberTugas,
      tanggalMulai, tanggalSelesai, semester, tahunAjaran,
      markaz, keterangan
    } = req.body;

    const project = await prisma.mcDaftarTugas.create({
      data: {
        id: crypto.randomUUID(),
        rencanaPekerjaan,
        kategori,
        status: status || 'REGISTER',
        prioritas,
        sumberTugas,
        markaz,
        keterangan,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        semester,
        tahunAjaran,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah project: ' + error.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      rencanaPekerjaan, kategori, status, prioritas, sumberTugas,
      tanggalMulai, tanggalSelesai, semester, tahunAjaran,
      markaz, keterangan
    } = req.body;

    const project = await prisma.mcDaftarTugas.update({
      where: { id },
      data: {
        rencanaPekerjaan,
        kategori,
        status,
        prioritas,
        sumberTugas,
        markaz,
        keterangan,
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        semester,
        tahunAjaran,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate project' });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mcDaftarTugas.delete({ where: { id } });
    res.json({ success: true, message: 'Project berhasil dihapus' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus project' });
  }
};

// --- BUDGET / RAB ---

exports.getProjectBudgets = async (req, res) => {
  try {
    const { projectId } = req.params;
    const budgets = await prisma.mcBudget.findMany({
      where: { mcDaftarTugasId: projectId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Get Budgets Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data RAB' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, estimatedCost, description, tipe, itemId, qty, hargaSatuan, pembayaranTipe } = req.body;
    
    const budget = await prisma.mcBudget.create({
      data: {
        id: crypto.randomUUID(),
        mcDaftarTugasId: projectId,
        category,
        estimatedCost: Number(estimatedCost),
        description,
        tipe,
        itemId,
        qty: qty ? Number(qty) : 1,
        hargaSatuan: hargaSatuan ? Number(hargaSatuan) : null,
        pembayaranTipe,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: budget });
  } catch (error) {
    console.error('Create Budget Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah RAB. Pastikan schema planId terpenuhi.' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    await prisma.mcBudget.delete({ where: { id: budgetId } });
    res.json({ success: true, message: 'RAB berhasil dihapus' });
  } catch (error) {
    console.error('Delete Budget Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus RAB' });
  }
};

// --- SUB TASKS (McSubTugas) ---

exports.createSubTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { namaPekerjaan, status, targetSelesai, catatan, pekerjaIds, vendorId } = req.body;
    
    const subTask = await prisma.mcSubTugas.create({
      data: {
        id: crypto.randomUUID(),
        mcDaftarTugasId: projectId,
        namaPekerjaan,
        status: status || 'PENDING',
        targetSelesai: targetSelesai ? new Date(targetSelesai) : null,
        catatan,
        pekerjaIds: pekerjaIds ? JSON.stringify(pekerjaIds) : null,
        vendorId,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: subTask });
  } catch (error) {
    console.error('Create SubTask Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah Pembagian Tugas' });
  }
};

exports.updateSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { namaPekerjaan, status, targetSelesai, catatan, pekerjaIds, vendorId } = req.body;
    
    const subTask = await prisma.mcSubTugas.update({
      where: { id: taskId },
      data: {
        namaPekerjaan,
        status,
        targetSelesai: targetSelesai ? new Date(targetSelesai) : null,
        catatan,
        pekerjaIds: pekerjaIds ? JSON.stringify(pekerjaIds) : null,
        vendorId,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: subTask });
  } catch (error) {
    console.error('Update SubTask Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate Pembagian Tugas' });
  }
};

exports.deleteSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await prisma.mcSubTugas.delete({ where: { id: taskId } });
    res.json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Delete SubTask Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus Tugas' });
  }
};
