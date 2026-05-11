const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.pembangunan.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply middleware to require admin access (LEGAL_VIEW or admin token)
router.use(authMiddleware);

// -- Workers --
router.get('/workers', controller.getWorkers);
router.post('/workers', controller.createWorker);
router.put('/workers/:id', controller.updateWorker);
router.delete('/workers/:id', controller.deleteWorker);

// -- Vendors --
router.get('/vendors', controller.getVendors);
router.post('/vendors', controller.createVendor);
router.put('/vendors/:id', controller.updateVendor);
router.delete('/vendors/:id', controller.deleteVendor);

// -- Materials --
router.get('/materials', controller.getMaterials);
router.post('/materials', controller.createMaterial);
router.put('/materials/:id', controller.updateMaterial);
router.delete('/materials/:id', controller.deleteMaterial);

module.exports = router;
