const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const userCtrl = require("../controllers/userController");


router.get("/profile", authMiddleware, userCtrl.getProfile);
router.put("/profile", authMiddleware, userCtrl.updateProfile);
router.post("/profile/avatar", authMiddleware, upload.single("file"), userCtrl.updateAvatar);
router.post("/change-password", authMiddleware, userCtrl.changePassword);

module.exports = router;
