const express = require('express');
const {
  getQuestions,
  saveQuizAttempt,
  getQuizAttempts,
  getQuizAttempt,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/attempts', getQuizAttempts);
router.get('/attempt/:attemptId', getQuizAttempt);
router.post('/attempt/:courseID', saveQuizAttempt);
router.get('/:courseID', getQuestions);

module.exports = router;
