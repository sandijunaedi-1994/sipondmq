const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const {
  getSdmUnits,
  createSaran,
  getSaranTerkirim,
  getSaranMasuk,
  updateStatusSaran
} = require('../controllers/admin.saran.controller');

router.use(requireAuth);

router.get('/units', getSdmUnits);
router.post('/', createSaran);
router.get('/sent', getSaranTerkirim);
router.get('/inbox', getSaranMasuk);
router.put('/:id/status', updateStatusSaran);

module.exports = router;
