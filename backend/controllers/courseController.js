const Course = require('../models/Course');

const createCourse = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    const course = await Course.create({
      name: name,
      userId: req.user._id,
    });

    return res.status(201).json({ course });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error creating course' });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error fetching courses' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error deleting course' });
  }
};

module.exports = {
  createCourse,
  getCourses,
  deleteCourse,
};
