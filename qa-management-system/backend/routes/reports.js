const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/release/:releaseId', asyncHandler(ctrl.releaseReport));
router.get('/release/:releaseId/csv', asyncHandler(ctrl.releaseReportCSV));
router.post('/release/:releaseId/publish', asyncHandler(ctrl.publish));
router.get('/', asyncHandler(ctrl.list));

module.exports = router;
