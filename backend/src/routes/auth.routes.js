const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile, updatePassword } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { message: 'Terlalu banyak percobaan login/register dari IP ini, silakan coba lagi setelah 15 menit.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', requireAuth, getProfile);
router.put('/password', requireAuth, updatePassword);

module.exports = router;
