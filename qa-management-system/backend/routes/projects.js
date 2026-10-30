const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/projectController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.get));
router.post('/', asyncHandler(ctrl.create));
router.put('/:id', asyncHandler(ctrl.update));
router.put('/:id/archive', asyncHandler(ctrl.archive));
router.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));

module.exports = router;
