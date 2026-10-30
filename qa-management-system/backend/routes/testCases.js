const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/testCaseController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));
router.put('/:id', asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

module.exports = router;
