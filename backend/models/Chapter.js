const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Chapter name is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Chapter order is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chapterSchema.virtual('topics', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'chapterId',
});

module.exports = mongoose.model('Chapter', chapterSchema);
