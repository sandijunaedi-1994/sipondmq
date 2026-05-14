const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTugasMasuk = async (req, res) => {
  try {
    const tasks = await prisma.userTask.findMany({
      where: { assigneeId: req.user.userId },
      include: {
        assigner: { select: { namaLengkap: true, role: true } },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tugas masuk:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTugasKeluar = async (req, res) => {
  try {
    const tasks = await prisma.userTask.findMany({
      where: { assignerId: req.user.userId },
      include: {
        assignee: { select: { namaLengkap: true, role: true } },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'desc' }
      ]
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tugas keluar:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTugas = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assigneeId } = req.body;
    
    if (!title || !assigneeId) {
      return res.status(400).json({ message: 'Title and Assignee are required' });
    }

    const task = await prisma.userTask.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        priority: priority || 'MEDIUM',
        taskType: 'MANUAL_DELEGATION',
        assigneeId,
        assignerId: req.user.userId,
        status: 'PENDING'
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating tugas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTugasStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'ON_PROGRESS', 'REVIEW', 'SELESAI'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existingTask = await prisma.userTask.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Assignee can only change to ON_PROGRESS, REVIEW, SELESAI
    // Assigner can change anything.
    
    const task = await prisma.userTask.update({
      where: { id },
      data: { status }
    });
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating tugas status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTugas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTask = await prisma.userTask.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (existingTask.assignerId !== req.user.userId && !req.user.permissions?.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.userTask.delete({ where: { id } });
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting tugas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getTugasMasuk,
  getTugasKeluar,
  createTugas,
  updateTugasStatus,
  deleteTugas
};
