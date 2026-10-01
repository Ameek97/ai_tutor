const StudyMaterial = require('../models/StudyMaterial');
const { pythonRequest } = require('../services/pythonService');

const topics = [
  'Normalization',
  'Functional Dependencies',
  'ER Model',
  'Relational Algebra',
  'Transactions',
];

const getQuestions = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findOne({
      userId: req.user.id,
      courseId: req.params.courseID,
    }).sort({ createdAt: -1 });

    if (!studyMaterial) {
      return res.status(404).json({
        message: 'No study material found for this course',
      });
    }

    const response = await pythonRequest({
      method: 'post',
      path: '/quiz',
      data: {
        user_id: req.user.id,
        course_id: req.params.courseID,
        topics,
        doc_id: studyMaterial._id.toString(),
      },
      timeout: 180000,
    });

    const quizData = Array.isArray(response.data)
      ? response.data
      : response.data.quizData;

    return res.json({ quizData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to fetch quiz questions' });
  }
};

module.exports = {
  getQuestions,
};
