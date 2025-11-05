const multer = require("multer");

// Lưu RAM → upload stream lên Cloudinary
const storage = multer.memoryStorage();

// === Filters ===
const imageFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif|jpg)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const videoFilter = (req, file, cb) => {
  if (/^video\/(mp4|quicktime|x-matroska|webm|x-msvideo)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only video files are allowed"), false);
};

const anyFilter = (req, file, cb) => cb(null, true);

// === Limits (có thể tăng/giảm) ===
const IMAGE_LIMITS = { fileSize: 10 * 1024 * 1024 };    // 10MB
const VIDEO_LIMITS = { fileSize: 120 * 1024 * 1024 };   // 120MB
const ANY_LIMITS   = { fileSize: 120 * 1024 * 1024 };

// === Export các middleware ===
exports.uploadAvatar = multer({ storage, fileFilter: imageFilter, limits: IMAGE_LIMITS }).single("avatar");
exports.uploadImagesMw = multer({ storage, fileFilter: imageFilter, limits: IMAGE_LIMITS }).array("images", 10);
exports.uploadVideoMw  = multer({ storage, fileFilter: videoFilter, limits: VIDEO_LIMITS }).single("video");

// Dùng cho Import Excel/CSV
exports.uploadAnySingle = multer({ storage, fileFilter: anyFilter, limits: ANY_LIMITS }).single("file");
