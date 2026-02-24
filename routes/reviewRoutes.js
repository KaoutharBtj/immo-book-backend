const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createReview, getAllReview } = require('../controllers/reviewController');

router.post('/:projectId',  protect,  authorize('client_physique', 'client_entreprise'), createReview);
router.get('/:projectId', protect, authorize('promoteur'), getAllReview);

module.exports = router;