const multer = require('multer');

// Giới hạn: 5MB/file, chấp nhận ảnh phổ biến
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(png|jpe?g|webp|gif|svg\+xml)/.test(file.mimetype);
    return ok ? cb(null, true) : cb(new Error('File không phải ảnh hợp lệ'));
  },
});

module.exports = upload;
