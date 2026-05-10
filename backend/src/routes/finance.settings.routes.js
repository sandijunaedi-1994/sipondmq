const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth.middleware');
const {
  getTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  createPeriode,
  updatePeriode,
  deletePeriode,
  calculateBiaya
} = require('../controllers/finance.settings.controller');

router.use(requireAdmin);

router.get('/settings/calculate', calculateBiaya);
router.get('/settings', getTahunAjaran);
router.post('/settings', createTahunAjaran);
router.put('/settings/:id', updateTahunAjaran);
router.delete('/settings/:id', deleteTahunAjaran);

router.post('/settings/:id/periode', createPeriode);
router.put('/settings/periode/:periodeId', updatePeriode);
router.delete('/settings/periode/:periodeId', deletePeriode);

module.exports = router;
