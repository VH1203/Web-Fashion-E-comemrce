const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth.authMiddleware, bankController.getBanks);
router.post("/", auth.authMiddleware, bankController.addBank);
router.delete("/:id", auth.authMiddleware, bankController.deleteBank);

module.exports = router;
