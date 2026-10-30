const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const ctrl = require('../controllers/publicController');

// No auth — these are the read-only public dashboard endpoints.
router.get('/latest', asyncHandler(ctrl.latest));
router.get('/history', asyncHandler(ctrl.history));
router.get('/reports/:id', asyncHandler(ctrl.byId));

module.exports = router;
