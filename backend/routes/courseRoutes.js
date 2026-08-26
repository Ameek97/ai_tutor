const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
} = require('../controllers/courseController');
const { getCourseSyllabus } = require('../controllers/syllabusController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:courseId/syllabus', getCourseSyllabus);
router.get('/:id', getCourseById);
router.delete('/:id', deleteCourse);

module.exports = router;
