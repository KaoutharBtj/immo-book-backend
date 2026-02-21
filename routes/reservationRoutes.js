const express = require('express');
const router = express.Router();
const {protect, authorize} = require ('../middleware/authMiddleware'); 
const {createReservation, 
        getMyReservation, 
        approveReservation, 
        refuseReservation} 
        = require('../controllers/reservationController');

router.post('/', protect,  authorize('client_physique', 'client_entreprise'), createReservation);
router.get('/my', protect,  authorize('client_physique', 'client_entreprise'), getMyReservation);
router.put('/:id/approve',protect, authorize('promoteur'), approveReservation);
router.put('/:id/refuse', protect, authorize('promoteur'), refuseReservation);

module.exports = router;