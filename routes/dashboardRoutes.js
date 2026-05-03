const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getPromoStats } = require('../controllers/dashboardController');

router.get('/', protect, authorize('promoteur'), getPromoStats);

module.exports = router;