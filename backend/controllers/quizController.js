const axios = require('axios');

const getQuestions = async (req, res) => {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;

    if (!pythonServiceUrl) {
      return res.status(500).json({
        message: 'PYTHON_SERVICE_URL is missing from environment variables',
      });
    }

    const token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    const response = await axios.get(
      `${pythonServiceUrl.replace(/\/$/, '')}/${req.params.courseID}`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }
    );

    return res.json({ quizData: response.data.quizData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to fetch quiz questions' });
  }
};

module.exports = {
  getQuestions,
};
