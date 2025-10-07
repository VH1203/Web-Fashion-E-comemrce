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

router.get("/", requireRole("support","owner","admin"), ctrl.list);
router.get("/:id", requireRole("support","owner","admin"), ctrl.detail);

router.post("/", requireRole("support","owner","admin"), idempotency(), ctrl.create);
router.patch("/:id", requireRole("support","owner","admin"), ctrl.update);

router.post("/:id/attachments", requireRole("support","owner","admin"), idempotency(), upload.single("file"), ctrl.addAttachment);
router.post("/:id/ask-more",    requireRole("support","owner","admin"), idempotency(), ctrl.askMore);
router.post("/:id/process",     requireRole("support","owner","admin"), idempotency(), ctrl.process);
router.post("/:id/propose",     requireRole("support","owner","admin"), idempotency(), ctrl.propose);

router.post("/:id/approve",     requireRole("owner","admin"), idempotency(), ctrl.approve);
router.post("/:id/reject",      requireRole("owner","admin"), idempotency(), ctrl.reject);

router.post("/:id/resolve",     requireRole("support","owner","admin"), idempotency(), ctrl.resolve);
router.post("/:id/close",       requireRole("support","owner","admin"), idempotency(), ctrl.close);

router.get("/export.csv",       requireRole("support","owner","admin"), ctrl.exportCsv);
router.get("/export.pdf",       requireRole("support","owner","admin"), ctrl.exportPdf);
// Intake: System Admin tạo ticket từ kênh công khai
router.post("/intake",
  requireRole("system_admin"),
  idempotency(),
  ctrl.createIntake
);

// Route ticket từ System Admin → Shop
router.post("/:id/route",
  requireRole("system_admin"),
  idempotency(),
  ctrl.routeToShop
);

// Assign ticket tới một agent cụ thể (System Admin)
router.post("/:id/assign",
  requireRole("system_admin"),
  idempotency(),
  ctrl.assignAgent
);

// Support tự claim ticket
router.post("/:id/claim",
  requireRole("support"),
  idempotency(),
  ctrl.claimTicket
);

// System Admin thu hồi/return về hàng đợi trung tâm
router.post("/:id/return",
  requireRole("system_admin"),
  idempotency(),
  ctrl.returnToSystem
);
module.exports = router;
