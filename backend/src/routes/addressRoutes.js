const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth.authMiddleware, addressController.getAddresses);
router.post("/", auth.authMiddleware, addressController.addAddress);
router.delete("/:id", auth.authMiddleware, addressController.deleteAddress);


module.exports = router;
