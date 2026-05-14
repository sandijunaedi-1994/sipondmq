const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/admin.notifikasi.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', notifikasiController.getNotifikasi);
router.put('/read-all', notifikasiController.markAllAsRead);
router.put('/:id/read', notifikasiController.markAsRead);

module.exports = router;
