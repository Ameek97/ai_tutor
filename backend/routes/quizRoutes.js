const express = require('express');
const { getQuestions } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:courseID', getQuestions);

module.exports = router;
