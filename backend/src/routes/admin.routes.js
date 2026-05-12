const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { requireAdmin } = require('../middleware/auth.middleware');

const dokumenController = require('../controllers/admin.dokumen.controller');
const broadcastController = require('../controllers/admin.broadcast.controller');

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

const { getSantriAktif, importSantriCsv, getSantriDetail, deleteSantri, generateMassNis } = require('../controllers/admin.santri.controller');

const {
  getCatatan, createCatatan, updateCatatan, deleteCatatan
} = require('../controllers/admin.catatan.controller');

const {
  getKalender, createKalender, updateKalender, deleteKalender, updateKalenderBatch
} = require('../controllers/admin.kalender.controller');

const {
  getRoutineTasks, createRoutineTask, updateRoutineTask, deleteRoutineTask,
  getRoutineSchedules, updateRoutineScheduleStatus, generateSchedules,
  addAdhocRoutine, addInitiativeTask, getDashboardTasks, updateUserTaskStatus
} = require('../controllers/admin.routine.controller');

const { getTodayChat, sendChatMessage } = require('../controllers/admin.chat.controller');

const { getHierarchy, assignSupervisors } = require('../controllers/admin.hierarchy.controller');

// Semua rute admin butuh role ADMIN_PUSAT
router.use(requireAdmin);

// Hirarki Pengguna
router.get('/hierarchy', getHierarchy);
router.post('/hierarchy', assignSupervisors);

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

// Dashboard Tasks
router.get('/dashboard/tasks', getDashboardTasks);

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
router.post('/santri/generate-nis', generateMassNis);
router.get('/santri/:id', getSantriDetail);
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
  getMyProfile
} = require('../controllers/admin.sdm.controller');

// ==========================================
// 14. MANAJEMEN SDM (PEGAWAI)
// ==========================================
router.get('/sdm/pegawai/me', requireAdmin, getMyProfile);
router.get('/sdm/pegawai', requireAdmin, getPegawaiList);
router.get('/sdm/pegawai/:id', requireAdmin, getPegawaiById);
router.post('/sdm/pegawai', requireAdmin, createPegawai);
router.put('/sdm/pegawai/:id', requireAdmin, updatePegawai);
router.delete('/sdm/pegawai/:id', requireAdmin, deletePegawai);
router.post('/sdm/pegawai/:id/link', requireAdmin, linkAccount);

module.exports = router;
