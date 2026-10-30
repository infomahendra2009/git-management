const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.get('/users', requireRole('admin'), asyncHandler(ctrl.listUsers));
router.post('/users', requireRole('admin'), asyncHandler(ctrl.createUser));
router.put('/users/:id/role', requireRole('admin'), asyncHandler(ctrl.updateUserRole));
router.delete('/users/:id', requireRole('admin'), asyncHandler(ctrl.removeUser));
router.get('/app', asyncHandler(ctrl.getAppSettings));
router.put('/app', requireRole('admin'), asyncHandler(ctrl.updateAppSettings));

module.exports = router;
