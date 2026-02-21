const express = require('express');
const router = express.Router();
const { protect,  authorize } = require('../middleware/authMiddleware');
const { getAllProjects, getProjectById } = require('../controllers/clientProjectController');

router.get('/', protect,  authorize('client_physique', 'client_entreprise'), getAllProjects);
router.get('/:id', protect, authorize('client_physique', 'client_entreprise'), getProjectById);

module.exports = router;