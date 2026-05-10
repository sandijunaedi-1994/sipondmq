const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { submitInterview, getInterviewStatus, getPublicInterviewQuestions } = require('../controllers/interview.controller');

const router = express.Router();

router.get('/questions', getPublicInterviewQuestions);

router.use(requireAuth);

router.post('/submit', submitInterview);
router.get('/status', getInterviewStatus);

module.exports = router;
