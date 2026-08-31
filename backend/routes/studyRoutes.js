const express = require('express');
const { chat } = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/chat', chat);

module.exports = router;
