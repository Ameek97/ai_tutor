const express = require('express');
const { updateTopicCompleted } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.patch('/:topicId', updateTopicCompleted);

module.exports = router;
