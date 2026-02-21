const express = require('express');
const router = express.Router();
const {protect, authorize} = require ('../middleware/authMiddleware'); 
const {addFavoris, removeFavoris, getMyFavoris} = require('../controllers/favorisController');

router.get('/', protect, authorize('client_physique', 'client_entreprise'), getMyFavoris);

router.post('/', protect, authorize('client_physique', 'client_entreprise'), addFavoris);
router.delete('/:id',  protect, authorize('client_physique', 'client_entreprise'), removeFavoris);

module.exports = router;