const express = require('express');
const router = express.Router();
const {protect, authorize} = require ('../middleware/authMiddleware'); 
const {createReservation, 
        getMyReservation, 
        approveReservation, 
        refuseReservation,
        getPromoReservations} 
        = require('../controllers/reservationController');

router.get('/my', protect, authorize('client_physique', 'client_entreprise'), getMyReservation);
router.get('/promoteur', protect, authorize('promoteur'), getPromoReservations);
router.put('/:id/approve', protect, authorize('promoteur'), approveReservation);
router.put('/:id/refuse', protect, authorize('promoteur'), refuseReservation);
router.post('/:id', protect, authorize('client_physique', 'client_entreprise'), createReservation);

module.exports = router;