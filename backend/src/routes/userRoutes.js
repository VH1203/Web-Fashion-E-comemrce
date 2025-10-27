const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware"); // giữ nguyên auth của anh (named export)
const { uploadAvatar } = require("../middlewares/uploadMiddleware");
const ctrl = require("../controllers/userController");

// /api/users
router.get("/", verifyToken, ctrl.getProfile);          // GET  /api/users
router.put("/", verifyToken, ctrl.updateProfile);       // PUT  /api/users
router.patch("/change-password", verifyToken, ctrl.changePassword);
router.post("/avatar", verifyToken, uploadAvatar, ctrl.uploadAvatar);

module.exports = router;
