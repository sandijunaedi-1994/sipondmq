const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portal.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { getPublicInterviewQuestions } = require('../controllers/interview.controller');

// All portal routes require authentication
router.use(requireAuth);

// Get children linked to the parent
router.get('/children', portalController.getChildren);
router.put('/children/:santriId/hubungan', portalController.updateHubunganWali);

// Finance
router.get('/finance/:santriId', portalController.getFinance);
router.put('/finance/:santriId/limit', portalController.setPocketMoneyLimit);

// Academic & Disciplinary
router.get('/academic/:santriId', portalController.getAcademic);

// Permissions
router.get('/permissions/:santriId', portalController.getPermissions);
router.post('/permissions/:santriId', portalController.requestPermission);

// Info & Bank Soal
router.get('/info', portalController.getInfo);
router.get('/interview-questions', getPublicInterviewQuestions);

// Health
const { getMyChildHealthRecords } = require('../controllers/portal.health.controller');
router.get('/health/:santriId', getMyChildHealthRecords);

// Debug prisma
router.get('/debug-prisma', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const hasCatatan = typeof prisma.catatanAdmin !== 'undefined';
    res.json({ hasCatatan });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
