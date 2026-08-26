const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Topic order is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Topic', topicSchema);
