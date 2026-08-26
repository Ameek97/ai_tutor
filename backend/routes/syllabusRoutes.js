const express = require('express');
const multer = require('multer');
const {
  getSyllabusByCourse,
  uploadSyllabus,
} = require('../controllers/syllabusController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 10MB' });
      }
      return res.status(400).json({ message: error.message });
    }

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return next();
  });
}, uploadSyllabus);

router.get('/:courseId', getSyllabusByCourse);



module.exports = router;
