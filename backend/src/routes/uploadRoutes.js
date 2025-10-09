const router = require('express').Router();
const upload = require('../middlewares/uploadMiddleware');
const ctrl = require('../controllers/uploadController');
// optional: auth + RBAC middleware
const { authMiddleware } = require('../middlewares/authMiddleware');
const {rbacMiddleware} = require("../middlewares/rbacMiddleware");

// Tùy quyền: shop_owner, admin, sales có thể upload
router.post('/single', authMiddleware, rbacMiddleware(['shop_owner','system_admin','sales']), upload.single('file'), ctrl.uploadSingle);
router.post('/many',   authMiddleware, rbacMiddleware(['shop_owner','system_admin','sales']), upload.array('files', 8), ctrl.uploadMany);
router.delete('/',     authMiddleware, rbacMiddleware(['shop_owner','system_admin']), ctrl.deleteFile);

module.exports = router;
