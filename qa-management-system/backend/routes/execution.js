const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/executionController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/:testCaseId', asyncHandler(ctrl.getForTestCase));
router.put('/:testCaseId', asyncHandler(ctrl.setStatus));

module.exports = router;
