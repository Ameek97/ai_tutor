const Course = require('../models/Course');
const Syllabus = require('../models/Syllabus');
const cloudinary = require('../config/cloudinary');
const { extractTopicsFromSyllabus } = require('../services/extractTopicsService');

const uploadBufferToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'syllabi',
        resource_type: 'raw',
        public_id: `${Date.now()}-${originalName.replace(/\.pdf$/i, '')}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

const getSyllabusByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    const syllabus = await Syllabus.findOne({
      userId: req.user._id,
      courseId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ syllabus });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error fetching syllabus',
    });
  }
};

const uploadSyllabus = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this course' });
    }

    const cloudinaryResult = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const syllabus = await Syllabus.create({
      userId: req.user._id,
      courseId,
      fileName: req.file.originalname,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
    });

    try {
      const extraction = await extractTopicsFromSyllabus({
        document_id: syllabus._id.toString(),
        course_id: syllabus.courseId.toString(),
        pdf_url: syllabus.fileUrl,
      });

      console.log("FastAPI response:", JSON.stringify(extraction, null, 2));
      return res.status(201).json({ syllabus, extraction });
    } catch (pythonError) {
      return res.status(502).json({
        message: pythonError.message || 'Failed to extract topics from syllabus',
        syllabus,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error uploading syllabus',
    });
  }
};

module.exports = {
  getSyllabusByCourse,
  uploadSyllabus,
};
