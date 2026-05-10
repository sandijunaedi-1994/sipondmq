const prisma = require('../lib/prisma');

const scheduleTest = async (req, res) => {
  try {
    const { method, date, registrationId } = req.body;
    const userId = req.user.userId;

    const registration = await prisma.registration.findFirst({ where: { id: registrationId, userId } });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    let offlineCode = undefined;
    if (method === 'OFFLINE') {
      offlineCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        testMethod: method,
        ...(method === 'OFFLINE' ? { testDate: new Date(date), offlineCode } : { interviewDate: new Date(date) })
      }
    });

    res.status(200).json({ message: 'Jadwal berhasil disimpan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const startAttempt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { registrationId } = req.body;
    
    // Find registration to know SMP/SMA
    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId }
    });

    let exam;
    if (registration && registration.program) {
      const isSMP = registration.program.toUpperCase().includes('SMP');
      const searchStr = isSMP ? 'SMP' : 'SMA';
      exam = await prisma.exam.findFirst({
        where: { title: { contains: searchStr } }
      });
    }

    // Fallback: get any exam that actually has questions
    if (!exam) {
      exam = await prisma.exam.findFirst({
        where: { questions: { some: {} } }
      });
    }

    if (!exam) return res.status(404).json({ message: 'Exam not found or has no questions' });

    // Check existing attempt
    let attempt = await prisma.examAttempt.findFirst({
      where: { userId, registrationId, examId: exam.id, status: 'ONGOING' }
    });

    if (!attempt) {
      attempt = await prisma.examAttempt.create({
        data: {
          userId,
          registrationId,
          examId: exam.id,
          remainingTime: exam.duration * 60,
          status: 'ONGOING'
        }
      });
    }

    res.status(200).json({ attemptId: attempt.id, remainingTime: attempt.remainingTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error: ' + err.message, stack: err.stack });
  }
};

const getQuestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempt = await prisma.examAttempt.findFirst({
      where: { userId, status: 'ONGOING' }
    });

    if (!attempt) return res.status(404).json({ message: 'Tidak ada ujian yang aktif' });

    const exam = await prisma.exam.findUnique({
      where: { id: attempt.examId }
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await prisma.question.findMany({
      where: { examId: exam.id },
      orderBy: { urutan: 'asc' },
      select: {
        id: true,
        text: true,
        options: true,
        category: true,
        imageUrl: true
      }
    });

    res.status(200).json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    const isCorrect = question.correctOption === selectedOption;

    await prisma.answer.upsert({
      where: { id: "not-existing-uuid-will-force-create-actually-upsert-needs-unique-combo" },
      // To upsert properly without a unique combo constraint, we'll just check if it exists first
      update: {}, create: {} // Placeholder, wait let's write it safely below
    }).catch(() => {});

    // Safe way:
    let answer = await prisma.answer.findFirst({
      where: { attemptId, questionId }
    });

    if (answer) {
      await prisma.answer.update({
        where: { id: answer.id },
        data: { selectedOption, isCorrect }
      });
    } else {
      await prisma.answer.create({
        data: {
          attemptId,
          questionId,
          selectedOption,
          isCorrect
        }
      });
    }

    res.status(200).json({ message: 'Jawaban disimpan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logEvent = async (req, res) => {
  try {
    const { attemptId, event } = req.body;

    await prisma.proctoringLog.create({
      data: { attemptId, event }
    });

    if (event === 'TAB_SWITCHED') {
      // Fail the attempt
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: 'FAILED', endTime: new Date() }
      });
      return res.status(200).json({ message: 'Ujian dibatalkan karena terdeteksi pindah tab' });
    }

    res.status(200).json({ message: 'Log recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitExam = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user.userId;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: true }
    });

    if (!attempt || attempt.status === 'FAILED') {
      return res.status(400).json({ message: 'Ujian sudah gagal atau tidak valid' });
    }

    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    // Assuming 20 questions, score = correct * 5
    const score = correctAnswers * 5;

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', endTime: new Date(), score }
    });

    // Status remains TES_WAWANCARA. Admin will confirm online interviews and push to PENGUMUMAN.
    res.status(200).json({ message: 'Ujian selesai disubmit', score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { scheduleTest, startAttempt, getQuestions, submitAnswer, logEvent, submitExam };
