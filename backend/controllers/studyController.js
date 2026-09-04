const mongoose = require('mongoose');
const Course = require('../models/Course');
const { pythonRequest } = require('../services/pythonService');

const CHAT_TIMEOUT_MS = 120000;

const isObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value);
};

const chat = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { course_id, messages } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!isObjectId(course_id)) {
      return res.status(400).json({ message: 'Course ID is invalid' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages are required' });
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || !String(latestMessage.message || '').trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const course = await Course.findOne({
      _id: course_id,
      userId: req.user._id,
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log(`[CHAT] Request received course_id=${course_id}`);

    const started = Date.now();
    const response = await pythonRequest({
      method: 'post',
      path: '/userQuery',
      data: {
        user_id: userId,
        course_id,
        messages,
      },
      timeout: CHAT_TIMEOUT_MS,
    });

    console.log(`[CHAT] Response returned (${Date.now() - started} ms)`);

    return res.status(200).json({
      answer: response.data.answer,
    });
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.message || error.message;
      const message = typeof detail === 'string' ? detail : JSON.stringify(detail);

      return res.status(error.response.status).json({
        message,
      });
    }

    if (error.request) {
      return res.status(502).json({
        message: 'Unable to reach the AI service',
      });
    }

    return res.status(500).json({
      message: error.message || 'Server error processing chat',
    });
  }
};

module.exports = {
  chat,
};
