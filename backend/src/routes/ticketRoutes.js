const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/ticketController');
const { authMiddleware: auth } = require('../middlewares/authMiddleware');
const { allow } = require('../middlewares/rbacMiddleware');  // <-- lấy allow
const upload = require('../middlewares/uploadMiddleware');

const ROLES = {
  CUSTOMER: 'customer',
  SUPPORT: 'support',
  SHOP_OWNER: 'shop_owner',
  ADMIN: 'admin',
};

router.post('/', auth, allow([ROLES.CUSTOMER]), upload.array('images', 5), ctrl.create);
router.get('/my', auth, allow([ROLES.CUSTOMER]), ctrl.myTickets);
router.get('/support/queue', auth, allow([ROLES.SUPPORT]), ctrl.supportQueue);
router.post('/:id/assign', auth, allow([ROLES.SHOP_OWNER, ROLES.ADMIN]), ctrl.assign);
router.patch('/:id/status', auth, allow([ROLES.SUPPORT, ROLES.SHOP_OWNER, ROLES.ADMIN]), ctrl.setStatus);
router.post('/:id/logs', auth, allow([ROLES.SUPPORT, ROLES.SHOP_OWNER, ROLES.ADMIN]), ctrl.addLog);
router.get('/:id', auth, ctrl.detail);

module.exports = router;
