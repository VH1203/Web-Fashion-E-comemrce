// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();

const { authMiddleware: auth } = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');
// Hỗ trợ cả 2 kiểu export: default function hoặc { allow }
const allow = rbac.allow || rbac;

const upload = require('../middlewares/uploadMiddleware');
const ctrl = require('../controllers/uploadController');

const UPLOAD_ROLES = ['shop_owner', 'system_admin', 'sales'];

// single file (field name: file)
router.post(
  '/single',
  auth,
  allow(UPLOAD_ROLES),
  upload.single('file'),
  ctrl.uploadSingle
);

// many files (field name: files)
router.post(
  '/many',
  auth,
  allow(UPLOAD_ROLES),
  upload.array('files', 8),
  ctrl.uploadMany
);

// delete by public_id
router.delete(
  '/',
  auth,
  allow(UPLOAD_ROLES),
  ctrl.deleteFile
);

module.exports = router;
