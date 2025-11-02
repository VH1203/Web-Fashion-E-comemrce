// backend/src/routes/cartRoutes.js
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/cartController");

router.use(verifyToken); 

router.get("/", ctrl.getCart);
router.post("/add", ctrl.addItem);
router.patch("/item/:itemId", ctrl.updateItem);
router.delete("/item/:itemId", ctrl.removeItem);
router.post("/clear", ctrl.clearCart);

module.exports = router;
