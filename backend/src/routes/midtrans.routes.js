const express = require('express');
const { handleWebhook } = require('../controllers/midtrans.controller');

const router = express.Router();

// Midtrans webhook route
router.post('/webhook', handleWebhook);

module.exports = router;
