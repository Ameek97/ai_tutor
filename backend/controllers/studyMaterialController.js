const Course = require('../models/Course');
const StudyMaterial = require('../models/StudyMaterial');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'study_materials',
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

const getStudyMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    const studyMaterials = await StudyMaterial.find({
      userId: req.user._id,
      courseId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ studyMaterials });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error fetching study materials',
    });
  }
};

const uploadStudyMaterial = async (req, res) => {
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

    const studyMaterial = await StudyMaterial.create({
      userId: req.user._id,
      courseId,
      fileName: req.file.originalname,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
    });

    return res.status(201).json({ studyMaterial });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error uploading study material',
    });
  }
};

const deleteStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findById(req.params.id);

    if (!studyMaterial) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    if (studyMaterial.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this study material' });
    }

    if (studyMaterial.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(studyMaterial.cloudinaryPublicId, {
        resource_type: 'raw',
      });
    }

    await studyMaterial.deleteOne();

    return res.status(200).json({ message: 'Study material deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error deleting study material',
    });
  }
};

module.exports = {
  getStudyMaterialsByCourse,
  uploadStudyMaterial,
  deleteStudyMaterial,
};
