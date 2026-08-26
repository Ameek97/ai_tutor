const Course = require('../models/Course');
const Topic = require('../models/Topic');

const updateTopicCompleted = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be a boolean' });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const course = await Course.findById(topic.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this topic' });
    }

    topic.completed = completed;
    await topic.save();

    return res.status(200).json(topic);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error updating topic',
    });
  }
};

module.exports = {
  updateTopicCompleted,
};
