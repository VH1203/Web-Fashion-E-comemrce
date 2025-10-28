// src/middlewares/uploadMiddleware.js
const multer = require('multer');

// dùng memory để có req.file.buffer / req.files[].buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // tùy nhu cầu lọc file: ảnh/video/pdf...
  cb(null, true);
};

const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB / file
};

const upload = multer({ storage, fileFilter, limits });

// export trực tiếp instance để dùng: upload.single / upload.array
module.exports = upload;
