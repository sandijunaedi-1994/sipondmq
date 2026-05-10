const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodayChat = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await prisma.groupMessage.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const message = await prisma.groupMessage.create({
      data: {
        content,
        userId: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getTodayChat,
  sendChatMessage
};
