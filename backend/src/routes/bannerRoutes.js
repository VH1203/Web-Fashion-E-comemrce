const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { verifyToken } = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = multer();

router.get("/", verifyToken, bannerController.getAllBanners);
router.get("/:id", verifyToken, bannerController.getBannerById);
router.post("/", verifyToken, bannerController.createBanner);
router.put("/:id", verifyToken, bannerController.updateBanner);
router.delete("/:id", verifyToken, bannerController.deleteBanner);
router.post(
  "/upload-image",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });

      // Gọi controller upload
      const result = await bannerController.uploadBufferToCloudinary(req.file.buffer);
      res.json({ upload: result });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
