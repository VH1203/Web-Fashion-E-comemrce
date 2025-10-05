// ticketRoutes.js 
const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/ticketController");
const requireRole = require("../middlewares/requireRole");
const idempotency = require("../middlewares/idempotency");

// giả định bạn đã có auth middleware set req.user
const auth = require("../middlewares/auth"); // nếu đã có, dùng cái của bạn

// Upload middleware (tùy CDN của bạn). Tối thiểu support single("file")
const upload = require("../middlewares/upload") || { single: () => (req,res,next)=>next() };

router.use(auth); // JWT required

router.get("/", requireRole("cskh","owner","admin"), ctrl.list);
router.get("/:id", requireRole("cskh","owner","admin"), ctrl.detail);

router.post("/", requireRole("cskh","owner","admin"), idempotency(), ctrl.create);
router.patch("/:id", requireRole("cskh","owner","admin"), ctrl.update);

router.post("/:id/attachments", requireRole("cskh","owner","admin"), idempotency(), upload.single("file"), ctrl.addAttachment);
router.post("/:id/ask-more",    requireRole("cskh","owner","admin"), idempotency(), ctrl.askMore);
router.post("/:id/process",     requireRole("cskh","owner","admin"), idempotency(), ctrl.process);
router.post("/:id/propose",     requireRole("cskh","owner","admin"), idempotency(), ctrl.propose);

router.post("/:id/approve",     requireRole("owner","admin"), idempotency(), ctrl.approve);
router.post("/:id/reject",      requireRole("owner","admin"), idempotency(), ctrl.reject);

router.post("/:id/resolve",     requireRole("cskh","owner","admin"), idempotency(), ctrl.resolve);
router.post("/:id/close",       requireRole("cskh","owner","admin"), idempotency(), ctrl.close);

router.get("/export.csv",       requireRole("cskh","owner","admin"), ctrl.exportCsv);
router.get("/export.pdf",       requireRole("cskh","owner","admin"), ctrl.exportPdf);

module.exports = router;
