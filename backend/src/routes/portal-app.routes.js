const express = require('express');
const {
  getPortalApps,
  createPortalApp,
  updatePortalApp,
  deletePortalApp
} = require('../controllers/portal-app.controller');
const { requireAdmin, requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, getPortalApps);
router.post('/', requireAdmin, createPortalApp);
router.put('/:id', requireAdmin, updatePortalApp);
router.delete('/:id', requireAdmin, deletePortalApp);

module.exports = router;
