const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../public/uploads/avatars/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/avatars/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadDisk = multer({ storage: storage });

const { requireAdmin } = require('../middleware/auth.middleware');

const dokumenController = require('../controllers/admin.dokumen.controller');
const broadcastController = require('../controllers/admin.broadcast.controller');
const sdmOrganisasiController = require('../controllers/admin.sdm.organisasi.controller');
const literasiController = require('../controllers/admin.literasi.controller');
const jadwalController = require('../controllers/admin.jadwal.controller');

const {
  getDashboardStats,
  offlineRegister,
  updateRegistrationData,
  getPpdbList,
  getPpdbDetail,
  updateDocumentStatus,
  updateSchedule,
  updateInterviewerEvaluation,
  processKelulusan,
  getAdminList,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getPengujiList,
  checkInOffline,
  updateUangMasukDeadline,
  updateUangMasukNominal,
  recordManualPayment,
  getMarkazList,
  resetUserPassword,
  deleteRegistration,
  sendResetLink
} = require('../controllers/admin.controller');

const {
  getCbtQuestions, createCbtQuestion, updateCbtQuestion, deleteCbtQuestion,
  getInterviewQuestions, createInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion,
  getOfflineSchedules, createOfflineSchedule, updateOfflineSchedule, deleteOfflineSchedule,
  getOnlineSchedules, createOnlineSchedule, updateOnlineSchedule, deleteOnlineSchedule,
  getInterviewerRubrics, createInterviewerRubric, updateInterviewerRubric, deleteInterviewerRubric,
  getSurveys, updateSurveyStatus
} = require('../controllers/admin.ppdb.controller');

const { getSantriAktif, importSantriCsv, getSantriDetail, deleteSantri, generateMassNis, getSantriWaliKelas, updateSantriDetail } = require('../controllers/admin.santri.controller');

const {
  getCatatan, createCatatan, updateCatatan, deleteCatatan
} = require('../controllers/admin.catatan.controller');

const {
  getKalender, createKalender, updateKalender, deleteKalender, updateKalenderBatch
} = require('../controllers/admin.kalender.controller');

const {
  getRoutineTasks, createRoutineTask, updateRoutineTask, deleteRoutineTask,
  getRoutineSchedules, updateRoutineScheduleStatus, generateSchedules, deleteRoutineSchedule,
  addAdhocRoutine, addInitiativeTask, getDashboardTasks, getDashboardSummary, updateUserTaskStatus, deleteUserTask
} = require('../controllers/admin.routine.controller');

const { getTodayChat, sendChatMessage } = require('../controllers/admin.chat.controller');

const { getHierarchy, assignSupervisors, getMySubordinates } = require('../controllers/admin.hierarchy.controller');

const {
  getTugasMasuk, getTugasKeluar, createTugas, updateTugasStatus, deleteTugas
} = require('../controllers/admin.tugas.controller');

// Semua rute admin butuh role ADMIN_PUSAT
router.use(requireAdmin);

// Hirarki Pengguna
router.get('/hierarchy', getHierarchy);
router.post('/hierarchy', assignSupervisors);
router.get('/hierarchy/subordinates', getMySubordinates);

// Catatan Admin
router.get('/catatan', getCatatan);
router.post('/catatan', createCatatan);
router.put('/catatan/:id', updateCatatan);
router.delete('/catatan/:id', deleteCatatan);

// Aktivitas Rutin & Master Time
router.get('/routines/tasks', getRoutineTasks);
router.post('/routines/tasks', createRoutineTask);
router.put('/routines/tasks/:id', updateRoutineTask);
router.delete('/routines/tasks/:id', deleteRoutineTask);

router.get('/routines/schedules', getRoutineSchedules);
router.put('/routines/schedules/:id/status', updateRoutineScheduleStatus);
router.post('/routines/schedules/generate', generateSchedules);
router.post('/routines/adhoc', addAdhocRoutine);
router.post('/routines/initiative', addInitiativeTask);
router.put('/routines/initiative/:id/status', updateUserTaskStatus);
router.delete('/routines/initiative/:id', deleteUserTask);
router.delete('/routines/schedules/:id', deleteRoutineSchedule);

// Dashboard Tasks
router.get('/dashboard/tasks', getDashboardTasks);
router.get('/dashboard/summary', getDashboardSummary);

// Penugasan & Delegasi
router.get('/tugas/inbox', getTugasMasuk);
router.get('/tugas/outbox', getTugasKeluar);
router.post('/tugas', createTugas);
router.put('/tugas/:id/status', updateTugasStatus);
router.delete('/tugas/:id', deleteTugas);

// Group Chat
router.get('/group-chat', getTodayChat);
router.post('/group-chat', sendChatMessage);

// Kalender Kegiatan Admin
router.get('/kalender', getKalender);
router.post('/kalender', createKalender);
router.put('/kalender/batch', updateKalenderBatch);
router.put('/kalender/:id', updateKalender);
router.delete('/kalender/:id', deleteKalender);

// Master Data
router.get('/markaz', getMarkazList);

// Santri Management
router.get('/santri', getSantriAktif);
router.get('/santri/wali-kelas', getSantriWaliKelas);
router.post('/santri/generate-nis', generateMassNis);
router.get('/santri/:id', getSantriDetail);
router.put('/santri/:id', updateSantriDetail);
router.delete('/santri/:id', deleteSantri);
router.post('/santri/import', upload.single('file'), importSantriCsv);

// PPDB Management Core
router.get('/ppdb/dashboard', getDashboardStats);
router.post('/ppdb/offline-register', offlineRegister);
router.get('/ppdb', getPpdbList);
router.get('/ppdb/penguji', getPengujiList);
router.post('/ppdb/checkin', checkInOffline);

// ==========================================
// 14. SURVEY KUNJUNGAN
// ==========================================
router.get('/ppdb/survey', getSurveys);
router.put('/ppdb/survey/:id/action', updateSurveyStatus);

router.get('/ppdb/:id', getPpdbDetail);
router.put('/ppdb/:id/data', updateRegistrationData);
router.put('/ppdb/:id/document/:docId', updateDocumentStatus);
router.put('/ppdb/:id/schedule', updateSchedule);
router.put('/ppdb/:id/evaluation', updateInterviewerEvaluation);
router.put('/ppdb/:id/action', processKelulusan);
router.put('/ppdb/:id/uang-masuk-deadline', updateUangMasukDeadline);
  router.put('/ppdb/:id/uang-masuk-nominal', updateUangMasukNominal);
router.post('/ppdb/:id/manual-payment', recordManualPayment);
router.post('/ppdb/:id/reset-password', resetUserPassword);
router.delete('/ppdb/:id', deleteRegistration);

const {
  getKelas, createKelas, updateKelas, deleteKelas,
  getAsrama, createAsrama, updateAsrama, deleteAsrama,
  getKartuSantri, registerKartu, replaceKartu, toggleStatusKartu, getRiwayatKartu
} = require('../controllers/admin.santri-settings.controller');

// Pengaturan Kelas
router.get('/santri-settings/kelas', getKelas);
router.post('/santri-settings/kelas', createKelas);
router.put('/santri-settings/kelas/:id', updateKelas);
router.delete('/santri-settings/kelas/:id', deleteKelas);

// Pengaturan Asrama
router.get('/santri-settings/asrama', getAsrama);
router.post('/santri-settings/asrama', createAsrama);
router.put('/santri-settings/asrama/:id', updateAsrama);
router.delete('/santri-settings/asrama/:id', deleteAsrama);

// Pengaturan Kartu Santri
router.get('/santri-settings/kartu', getKartuSantri);
router.post('/santri-settings/kartu', registerKartu);
router.put('/santri-settings/kartu/:santriId/replace', replaceKartu);
router.put('/santri-settings/kartu/:santriId/toggle', toggleStatusKartu);
router.get('/santri-settings/kartu/:santriId/history', getRiwayatKartu);

// PPDB Setting: CBT Questions
router.get('/ppdb-settings/cbt', getCbtQuestions);
router.post('/ppdb-settings/cbt', createCbtQuestion);
router.put('/ppdb-settings/cbt/:id', updateCbtQuestion);
router.delete('/ppdb-settings/cbt/:id', deleteCbtQuestion);

// PPDB Setting: Interview Questions
router.get('/ppdb-settings/interview', getInterviewQuestions);
router.post('/ppdb-settings/interview', createInterviewQuestion);
router.put('/ppdb-settings/interview/:id', updateInterviewQuestion);
router.delete('/ppdb-settings/interview/:id', deleteInterviewQuestion);

// PPDB Setting: Offline Schedules
router.get('/ppdb-settings/offline-schedule', getOfflineSchedules);
router.post('/ppdb-settings/offline-schedule', createOfflineSchedule);
router.put('/ppdb-settings/offline-schedule/:id', updateOfflineSchedule);
router.delete('/ppdb-settings/offline-schedule/:id', deleteOfflineSchedule);

// PPDB Setting: Online Schedules
router.get('/ppdb-settings/online-schedule', getOnlineSchedules);
router.post('/ppdb-settings/online-schedule', createOnlineSchedule);
router.put('/ppdb-settings/online-schedule/:id', updateOnlineSchedule);
router.delete('/ppdb-settings/online-schedule/:id', deleteOnlineSchedule);

// PPDB Setting: Interviewer Rubrics
router.get('/ppdb-settings/interviewer-rubric', getInterviewerRubrics);
router.post('/ppdb-settings/interviewer-rubric', createInterviewerRubric);
router.put('/ppdb-settings/interviewer-rubric/:id', updateInterviewerRubric);
router.delete('/ppdb-settings/interviewer-rubric/:id', deleteInterviewerRubric);

// Admin Account Management
router.get('/users', getAdminList);
router.get('/users/:id', getAdminById);
router.post('/users', createAdmin);
router.put('/users/:id', updateAdmin);
router.delete('/users/:id', deleteAdmin);
router.post('/users/:id/send-reset-link', sendResetLink);

const {
  getGroupList, createGroup, updateGroup, deleteGroup
} = require('../controllers/admin.group.controller');

// Admin Group Management
router.get('/groups', getGroupList);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

const { getActivityLogs } = require('../controllers/admin.activity.controller');

// Activity Logs
router.get('/activity-logs', getActivityLogs);

const {
  getAllSantri,
  getSantriHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} = require('../controllers/admin.health.controller');

// Health Records Management
router.get('/health/santri', getAllSantri);
router.get('/health/:santriId', getSantriHealthRecords);
router.post('/health/:santriId', createHealthRecord);
router.put('/health/record/:id', updateHealthRecord);
router.delete('/health/record/:id', deleteHealthRecord);

// ==========================================
// 12. DOKUMEN & INFORMASI
// ==========================================
router.get('/informasi/kategori', requireAdmin, dokumenController.getKategori);
router.post('/informasi/kategori', requireAdmin, dokumenController.createKategori);
router.delete('/informasi/kategori/:id', requireAdmin, dokumenController.deleteKategori);

router.get('/informasi/dokumen', requireAdmin, dokumenController.getDokumen);
router.post('/informasi/dokumen', requireAdmin, dokumenController.createDokumen);
router.put('/informasi/dokumen/:id', requireAdmin, dokumenController.updateDokumen);
router.delete('/informasi/dokumen/:id', requireAdmin, dokumenController.deleteDokumen);

// ==========================================
// 13. BROADCAST
// ==========================================
router.get('/informasi/broadcast', requireAdmin, broadcastController.getBroadcasts);
router.post('/informasi/broadcast', requireAdmin, broadcastController.createBroadcast);
router.put('/informasi/broadcast/:id', requireAdmin, broadcastController.updateBroadcast);
router.delete('/informasi/broadcast/:id', requireAdmin, broadcastController.deleteBroadcast);

const {
  getPegawaiList,
  getPegawaiById,
  createPegawai,
  updatePegawai,
  deletePegawai,
  linkAccount,
  getMyProfile,
  uploadFotoProfil,
  uploadPegawaiBerkas,
  deletePegawaiBerkas
} = require('../controllers/admin.sdm.controller');

// ==========================================
// 14. MANAJEMEN SDM (PEGAWAI)
// ==========================================

const tahfidzController = require('../controllers/admin.tahfidz.controller');
const halaqohController = require('../controllers/admin.halaqoh.controller');

// ==========================================
// TAHFIDZ & HALAQOH
// ==========================================
router.get('/tahfidz/hafalan', requireAdmin, tahfidzController.getGlobalHafalan);
router.post('/tahfidz/hafalan', requireAdmin, tahfidzController.addGlobalHafalan);
router.put('/tahfidz/hafalan/:id', requireAdmin, tahfidzController.updateGlobalHafalan);
router.delete('/tahfidz/hafalan/:id', requireAdmin, tahfidzController.deleteGlobalHafalan);
router.get('/tahfidz/:santriId/tahapan', requireAdmin, tahfidzController.getTahapanSantri);
router.put('/tahfidz/:santriId/tahapan', requireAdmin, tahfidzController.updateTahapanSantri);
router.get('/tahfidz/:santriId/hafalan', requireAdmin, tahfidzController.getHafalanHarian);
router.post('/tahfidz/:santriId/hafalan', requireAdmin, tahfidzController.addHafalanHarian);
router.get('/tahfidz/:santriId/sertifikat', requireAdmin, tahfidzController.getSertifikatTahfidz);
router.post('/tahfidz/:santriId/sertifikat', requireAdmin, uploadDisk.single('file'), tahfidzController.uploadSertifikatTahfidz);
router.delete('/tahfidz/sertifikat/:id', requireAdmin, tahfidzController.deleteSertifikatTahfidz);

router.get('/halaqoh/me', requireAdmin, halaqohController.getMyHalaqoh);
router.get('/halaqoh', requireAdmin, halaqohController.getHalaqoh);
router.post('/halaqoh', requireAdmin, halaqohController.createHalaqoh);
router.put('/halaqoh/:id', requireAdmin, halaqohController.updateHalaqoh);
router.delete('/halaqoh/:id', requireAdmin, halaqohController.deleteHalaqoh);
router.get('/halaqoh/:halaqohId/santri', requireAdmin, halaqohController.getSantriHalaqoh);
router.post('/halaqoh/:halaqohId/santri', requireAdmin, halaqohController.assignSantriHalaqoh);
router.delete('/halaqoh/santri/:santriId', requireAdmin, halaqohController.removeSantriHalaqoh);
router.post('/halaqoh/:halaqohId/absensi', requireAdmin, halaqohController.inputAbsensiHalaqoh);
router.get('/sdm/pegawai/me', requireAdmin, getMyProfile);
router.post('/sdm/pegawai/me/foto', requireAdmin, uploadDisk.single('file'), uploadFotoProfil);
router.get('/sdm/pegawai', requireAdmin, getPegawaiList);
router.get('/sdm/pegawai/:id', requireAdmin, getPegawaiById);
router.post('/sdm/pegawai', requireAdmin, createPegawai);
router.put('/sdm/pegawai/:id', requireAdmin, updatePegawai);
router.delete('/sdm/pegawai/:id', requireAdmin, deletePegawai);
router.post('/sdm/pegawai/:id/link', requireAdmin, linkAccount);
router.post('/sdm/pegawai/:id/berkas', requireAdmin, uploadDisk.single('file'), uploadPegawaiBerkas);
router.delete('/sdm/pegawai/:id/berkas/:berkasId', requireAdmin, deletePegawaiBerkas);

router.get('/sdm/organisasi/unit', requireAdmin, sdmOrganisasiController.getUnits);
router.post('/sdm/organisasi/unit', requireAdmin, sdmOrganisasiController.createUnit);
router.put('/sdm/organisasi/unit/:id', requireAdmin, sdmOrganisasiController.updateUnit);
router.delete('/sdm/organisasi/unit/:id', requireAdmin, sdmOrganisasiController.deleteUnit);
router.post('/sdm/organisasi/posisi', requireAdmin, sdmOrganisasiController.createPosisi);
router.put('/sdm/organisasi/posisi/:id', requireAdmin, sdmOrganisasiController.updatePosisi);
router.delete('/sdm/organisasi/posisi/:id', requireAdmin, sdmOrganisasiController.deletePosisi);

const saranRouter = require('./admin.saran.routes');
router.use('/saran', requireAdmin, saranRouter);

const notifikasiRouter = require('./admin.notifikasi.routes');
router.use('/notifikasi', notifikasiRouter);

// SPMB Literasi (NotebookLM)
router.post('/spmb/literasi/upload', requireAdmin, literasiController.uploadMiddleware, literasiController.uploadDocument);
router.get('/spmb/literasi/documents', requireAdmin, literasiController.getDocuments);
router.delete('/spmb/literasi/documents/:id', requireAdmin, literasiController.deleteDocument);
router.post('/spmb/literasi/chat', requireAdmin, literasiController.chatWithDocument);

// Litbang & Budaya: Jadwal Pelajaran
router.get('/litbang/jadwal/mapel', requireAdmin, jadwalController.getMapel);
router.post('/litbang/jadwal/mapel', requireAdmin, jadwalController.createMapel);
router.put('/litbang/jadwal/mapel/:id', requireAdmin, jadwalController.updateMapel);
router.delete('/litbang/jadwal/mapel/:id', requireAdmin, jadwalController.deleteMapel);

router.get('/litbang/jadwal/jam', requireAdmin, jadwalController.getJam);
router.post('/litbang/jadwal/jam', requireAdmin, jadwalController.createJam);
router.delete('/litbang/jadwal/jam/:id', requireAdmin, jadwalController.deleteJam);

router.get('/litbang/jadwal/plotting', requireAdmin, jadwalController.getPlotting);
router.post('/litbang/jadwal/plotting', requireAdmin, jadwalController.createPlotting);
router.delete('/litbang/jadwal/plotting/:id', requireAdmin, jadwalController.deletePlotting);

router.get('/litbang/jadwal/generate', requireAdmin, jadwalController.getJadwal);
router.post('/litbang/jadwal/generate', requireAdmin, jadwalController.generateJadwal);

module.exports = router;
