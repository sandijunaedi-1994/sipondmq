const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { 
  scheduleTest, 
  startAttempt, 
  getQuestions, 
  submitAnswer, 
  logEvent, 
  submitExam 
} = require('../controllers/exam.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/schedule', scheduleTest);
router.post('/start', startAttempt);
router.get('/questions', getQuestions);
router.post('/answer', submitAnswer);
router.post('/log-event', logEvent);
router.post('/submit', submitExam);

module.exports = router;
