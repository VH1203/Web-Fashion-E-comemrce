// src/middlewares/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Thư mục tạm để lưu file (dev)
const UPLOAD_DIR = path.join(__dirname, "..", "..", "tmp_uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = {
  // Dùng trong routes: upload.single("file")
  single: (field) => upload.single(field || "file")
};
