const router = require("express").Router();
const {
  uploadSingle,
  uploadMany,
  deleteFile,
} = require("../controllers/uploadController");
const multer = require("multer");
const { imageFilter } = require("../middlewares/uploadMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter: imageFilter });

router.post("/single", upload.single("file"), uploadSingle);
router.post("/many", upload.array("files", 10), uploadMany);
router.delete("/", deleteFile);

module.exports = router;
