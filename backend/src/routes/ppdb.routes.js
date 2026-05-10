const express = require('express');
const { submitRegistration, getRegistrationStatus } = require('../controllers/ppdb.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { getPublicTahunAjaran } = require('../controllers/finance.settings.controller');

const router = express.Router();

// Public route for form options
router.get('/academic-years', getPublicTahunAjaran);

// Public routes
router.post('/survey', require('../controllers/ppdb.controller').submitSurvey);

// All PPDB routes require authentication
router.use(requireAuth);

router.post('/submit', submitRegistration);
router.get('/status', getRegistrationStatus);
router.post('/kelengkapan-data', require('../controllers/ppdb.controller').submitKelengkapanData);
router.post('/proceed-daftar-ulang', require('../controllers/ppdb.controller').proceedDaftarUlang);
router.get('/previous-family-data', require('../controllers/ppdb.controller').getPreviousFamilyData);

const { getOfflineSchedules, getOnlineSchedules } = require('../controllers/admin.ppdb.controller');
router.get('/offline-schedules', getOfflineSchedules);
router.get('/online-schedules', getOnlineSchedules);

module.exports = router;
