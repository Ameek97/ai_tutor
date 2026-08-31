const axios = require('axios');

const FASTAPI_CHAT_URL = 'http://localhost:8000/userQuery';



const chat = async (req, res) => {


  try {
    const userId = req.user._id.toString();
    const { course_id, messages } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages are required' });
    }

    const response = await axios.post(
      FASTAPI_CHAT_URL,
      {
        user_id:userId,
        course_id,
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return res.status(200).json(response.data);
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
