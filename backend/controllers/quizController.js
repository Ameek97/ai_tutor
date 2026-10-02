const StudyMaterial = require('../models/StudyMaterial');
const QuizAttempt = require('../models/QuizAttempt');
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

const saveQuizAttempt = async (req, res) => {
  try {
    const { quizData, answers } = req.body;

    if (!quizData || !answers) {
      return res.status(400).json({ message: 'Quiz data and answers are required' });
    }

    if (!Array.isArray(quizData) || quizData.length === 0) {
      return res.status(400).json({ message: 'Quiz data should contain questions' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    let score = 0;

    quizData.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += 1;
      }
    });

    const totalQuestions = quizData.length;

    const savedAttempt = await QuizAttempt.create({
      user_id: req.user.id,
      course_id: req.params.courseID,
      quizData,
      answers,
      score,
      totalQuestions,
    });

    return res.status(201).json({
      message: 'Quiz attempt saved successfully',
      attemptId: savedAttempt._id,
      score,
      totalQuestions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to save quiz attempt' });
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user_id: req.user.id })
      .select('_id course_id score totalQuestions createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ attempts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to fetch quiz attempts' });
  }
};

const getQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      user_id: req.user.id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    return res.status(200).json({
      attempt: {
        _id: attempt._id,
        course_id: attempt.course_id,
        quizData: attempt.quizData,
        answers: attempt.answers,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        createdAt: attempt.createdAt,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to fetch quiz attempt' });
  }
};

module.exports = {
  getQuestions,
  saveQuizAttempt,
  getQuizAttempts,
  getQuizAttempt,
};
