const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, asyncHandler(ctrl.summary));

module.exports = router;
