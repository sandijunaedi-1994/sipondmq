const prisma = require('../lib/prisma');

const submitInterview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { registrationId, answers } = req.body;

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId },
      include: { parentInterview: true }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
    }

    if (registration.parentInterview) {
      return res.status(400).json({ message: 'Form wawancara sudah diisi sebelumnya.' });
    }

    // Insert ParentInterview with JSON answers
    await prisma.parentInterview.create({
      data: {
        registrationId: registration.id,
        answers: answers
      }
    });

    res.status(200).json({ message: 'Form wawancara berhasil disubmit.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getInterviewStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const registration = await prisma.registration.findFirst({
      where: { userId },
      include: { parentInterview: true }
    });

    if (!registration) return res.status(404).json({ message: 'Not found' });

    res.status(200).json({ isSubmitted: !!registration.parentInterview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPublicInterviewQuestions = async (req, res) => {
  try {
    const questions = await prisma.interviewQuestion.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    });
    res.status(200).json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitInterview, getInterviewStatus, getPublicInterviewQuestions };


