const multer = require('multer');

// Lưu vào RAM, upload trực tiếp lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif|jpg)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const limits = { fileSize: 10 * 1024 * 1024 }; 

exports.uploadAvatar = multer({ storage, fileFilter, limits }).single('avatar');
