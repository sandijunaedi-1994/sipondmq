const express = require('express');
const { getBillingHistory } = require('../controllers/finance.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/bills', getBillingHistory);
router.post('/bills/:id/simulate-pay', require('../controllers/finance.controller').simulatePay);
router.post('/pay-installment', require('../controllers/finance.controller').payInstallment);
router.post('/pay-registration', require('../controllers/finance.controller').getSnapToken);

module.exports = router;
