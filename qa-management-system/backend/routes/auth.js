const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login', asyncHandler(ctrl.login));
router.post('/logout', requireAuth, asyncHandler(ctrl.logout));
router.post('/change-password', requireAuth, asyncHandler(ctrl.changePassword));
router.get('/me', requireAuth, asyncHandler(ctrl.me));

module.exports = router;
