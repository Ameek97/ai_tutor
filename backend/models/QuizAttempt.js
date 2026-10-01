const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, 'User ID is required'],
    },
    course_id: {
      type: String,
      required: [true, 'Course ID is required'],
    },
    quizData: {
      type: [mongoose.Schema.Types.Mixed],
      required: [true, 'Quiz data is required'],
    },
    answers: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
