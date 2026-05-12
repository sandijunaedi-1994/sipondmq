const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const ppdbRoutes = require('./routes/ppdb.routes');
const financeRoutes = require('./routes/finance.routes');
const examRoutes = require('./routes/exam.routes');
const interviewRoutes = require('./routes/interview.routes');
const portalRoutes = require('./routes/portal.routes');
const adminRoutes = require('./routes/admin.routes');
const midtransRoutes = require('./routes/midtrans.routes');
const financeSettingsRoutes = require('./routes/finance.settings.routes');
const portalAppsRoutes = require('./routes/portal-app.routes');
const pembangunanRoutes = require('./routes/admin.pembangunan.routes');
const prisma = require('./lib/prisma');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Attach io to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ppdb', ppdbRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/portal-apps', portalAppsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/finance', financeSettingsRoutes);
app.use('/api/admin/pembangunan', pembangunanRoutes);
app.use('/api/admin/projects', require('./routes/admin.project.routes'));
app.use('/api/midtrans', midtransRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_exam', async (attemptId) => {
    socket.join(attemptId);
    console.log(`Socket ${socket.id} joined room ${attemptId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Real-time Timer Sync loop
let isTimerSyncing = false;
setInterval(async () => {
  if (isTimerSyncing) return;
  isTimerSyncing = true;
  try {
    // Find all ongoing attempts
    const ongoingAttempts = await prisma.examAttempt.findMany({
      where: { status: 'ONGOING' }
    });

    for (const attempt of ongoingAttempts) {
      if (attempt.remainingTime > 0) {
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { remainingTime: attempt.remainingTime - 1 }
        });
        io.to(attempt.id).emit('time_sync', { remainingTime: attempt.remainingTime - 1 });
      } else {
        // Time is up, auto submit
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { status: 'COMPLETED', endTime: new Date() }
        });
        io.to(attempt.id).emit('time_up');
        // We should also calculate score and update registration status
        // But doing it here might be tricky, let's keep it simple
      }
    }
  } catch (err) {
    console.error("Timer loop error:", err);
  } finally {
    isTimerSyncing = false;
  }
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

