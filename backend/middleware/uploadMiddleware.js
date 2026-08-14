const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMimeType = file.mimetype === 'application/pdf';
  const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMimeType && isPdfExtension) {
    cb(null, true);
    return;
  }

  cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
