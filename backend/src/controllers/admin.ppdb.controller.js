const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// 1. SETTING SOAL TES CBT
// ==========================================

const getOrCreateExam = async (level) => {
  const title = `Tes CBT PPDB - ${level}`;
  let exam = await prisma.exam.findFirst({
    where: { title }
  });

  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title,
        duration: 90, // default 90 minutes
        passingGrade: 70
      }
    });
  }
  return exam;
};

const getCbtQuestions = async (req, res) => {
  try {
    const { level } = req.query;
    if (!level) return res.status(400).json({ message: 'Parameter level (jenjang) wajib diisi' });

    const exam = await getOrCreateExam(level);
    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
      orderBy: { urutan: 'asc' }
    });
    res.status(200).json({ questions, exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const createCbtQuestion = async (req, res) => {
  try {
    const { text, options, correctOption, category, level, urutan } = req.body;
    if (!level) return res.status(400).json({ message: 'Parameter level (jenjang) wajib diisi' });

    const exam = await getOrCreateExam(level);

    const question = await prisma.question.create({
      data: {
        examId: exam.id,
        text,
        options, // expected array of strings
        correctOption,
        category: category || 'Umum',
        urutan: urutan ? parseInt(urutan) : 0
      }
    });
    res.status(201).json({ message: 'Soal berhasil ditambahkan', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCbtQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctOption, category, urutan } = req.body;

    const data = { text, options, correctOption, category };
    if (urutan !== undefined) {
      data.urutan = parseInt(urutan);
    }

    const question = await prisma.question.update({
      where: { id },
      data
    });
    res.status(200).json({ message: 'Soal berhasil diperbarui', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCbtQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.status(200).json({ message: 'Soal berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// 2. SETTING PERTANYAAN WAWANCARA WALI
// ==========================================

const getInterviewQuestions = async (req, res) => {
  try {
    const questions = await prisma.interviewQuestion.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createInterviewQuestion = async (req, res) => {
  try {
    const { questionText, orderIndex, isActive } = req.body;
    
    // Auto order if not provided
    let finalOrder = orderIndex;
    if (finalOrder === undefined || finalOrder === null) {
      const lastQ = await prisma.interviewQuestion.findFirst({ orderBy: { orderIndex: 'desc' }});
      finalOrder = lastQ ? lastQ.orderIndex + 1 : 1;
    }

    const question = await prisma.interviewQuestion.create({
      data: { questionText, orderIndex: finalOrder, isActive: isActive ?? true }
    });
    res.status(201).json({ message: 'Pertanyaan berhasil ditambahkan', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, orderIndex, isActive } = req.body;

    const question = await prisma.interviewQuestion.update({
      where: { id },
      data: { questionText, orderIndex, isActive }
    });
    res.status(200).json({ message: 'Pertanyaan berhasil diperbarui', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.interviewQuestion.delete({ where: { id } });
    res.status(200).json({ message: 'Pertanyaan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// 3. SETTING JADWAL OFFLINE
// ==========================================

const getOfflineSchedules = async (req, res) => {
  try {
    const schedules = await prisma.offlineSchedule.findMany({
      orderBy: { date: 'asc' }
    });
    res.status(200).json({ schedules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createOfflineSchedule = async (req, res) => {
  try {
    const { date, timeStart, timeEnd, quota, isActive } = req.body;
    
    const schedule = await prisma.offlineSchedule.create({
      data: { 
        date: new Date(date), 
        timeStart, 
        timeEnd, 
        quota: parseInt(quota) || 10,
        isActive: isActive ?? true
      }
    });
    res.status(201).json({ message: 'Jadwal berhasil ditambahkan', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOfflineSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeStart, timeEnd, quota, isActive } = req.body;

    const schedule = await prisma.offlineSchedule.update({
      where: { id },
      data: { 
        date: date ? new Date(date) : undefined, 
        timeStart, 
        timeEnd, 
        quota: quota ? parseInt(quota) : undefined,
        isActive
      }
    });
    res.status(200).json({ message: 'Jadwal berhasil diperbarui', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteOfflineSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offlineSchedule.delete({ where: { id } });
    res.status(200).json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// 4. SETTING JADWAL ONLINE
// ==========================================

const getOnlineSchedules = async (req, res) => {
  try {
    const schedules = await prisma.onlineSchedule.findMany({
      orderBy: { date: 'asc' }
    });
    res.status(200).json({ schedules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createOnlineSchedule = async (req, res) => {
  try {
    const { date, timeStart, timeEnd, quota, isActive } = req.body;
    
    const schedule = await prisma.onlineSchedule.create({
      data: { 
        date: new Date(date), 
        timeStart, 
        timeEnd, 
        quota: parseInt(quota) || 10,
        isActive: isActive ?? true
      }
    });
    res.status(201).json({ message: 'Jadwal online berhasil ditambahkan', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOnlineSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeStart, timeEnd, quota, isActive } = req.body;

    const schedule = await prisma.onlineSchedule.update({
      where: { id },
      data: { 
        date: date ? new Date(date) : undefined, 
        timeStart, 
        timeEnd, 
        quota: quota ? parseInt(quota) : undefined,
        isActive
      }
    });
    res.status(200).json({ message: 'Jadwal online berhasil diperbarui', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteOnlineSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.onlineSchedule.delete({ where: { id } });
    res.status(200).json({ message: 'Jadwal online berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================================
// 5. SETTING RUBRIK WAWANCARA PENGUJI
// ==========================================

const getInterviewerRubrics = async (req, res) => {
  try {
    const rubrics = await prisma.interviewerRubric.findMany({
      orderBy: [
        { target: 'asc' },
        { urutan: 'asc' }
      ]
    });
    res.status(200).json({ rubrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createInterviewerRubric = async (req, res) => {
  try {
    const { target, topic, description, option1, option2, option3, urutan, isActive } = req.body;
    
    let finalOrder = urutan;
    if (finalOrder === undefined || finalOrder === null) {
      const lastR = await prisma.interviewerRubric.findFirst({ 
        where: { target: target || 'SANTRI' },
        orderBy: { urutan: 'desc' }
      });
      finalOrder = lastR ? lastR.urutan + 1 : 1;
    }

    const rubric = await prisma.interviewerRubric.create({
      data: {
        target: target || 'SANTRI',
        topic,
        description,
        option1,
        option2,
        option3,
        urutan: finalOrder,
        isActive: isActive ?? true
      }
    });
    res.status(201).json({ message: 'Rubrik berhasil ditambahkan', rubric });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateInterviewerRubric = async (req, res) => {
  try {
    const { id } = req.params;
    const { target, topic, description, option1, option2, option3, urutan, isActive } = req.body;

    const rubric = await prisma.interviewerRubric.update({
      where: { id },
      data: { target, topic, description, option1, option2, option3, urutan, isActive }
    });
    res.status(200).json({ message: 'Rubrik berhasil diperbarui', rubric });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteInterviewerRubric = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.interviewerRubric.delete({ where: { id } });
    res.status(200).json({ message: 'Rubrik berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSurveys = async (req, res) => {
  try {
    const surveys = await prisma.surveyKunjungan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        registration: true
      }
    });
    console.log(`[getSurveys] Returned ${surveys.length} surveys`);
    res.status(200).json({ surveys });
  } catch (error) {
    console.error("Error getSurveys:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSurveyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan, registrationId } = req.body;

    const survey = await prisma.surveyKunjungan.update({
      where: { id },
      data: {
        status,
        catatan: catatan || null,
        registrationId: registrationId || null
      }
    });

    res.status(200).json({ message: 'Status survei berhasil diupdate', survey });
  } catch (error) {
    console.error("Error updateSurveyStatus:", error);
    res.status(500).json({ message: 'Gagal mengupdate status survei' });
  }
};

module.exports = {
  getCbtQuestions,
  createCbtQuestion,
  updateCbtQuestion,
  deleteCbtQuestion,
  
  getInterviewQuestions,
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  
  getOfflineSchedules,
  createOfflineSchedule,
  updateOfflineSchedule,
  deleteOfflineSchedule,

  getOnlineSchedules,
  createOnlineSchedule,
  updateOnlineSchedule,
  deleteOnlineSchedule,

  getInterviewerRubrics,
  createInterviewerRubric,
  updateInterviewerRubric,
  deleteInterviewerRubric,

  getSurveys,
  updateSurveyStatus
};
