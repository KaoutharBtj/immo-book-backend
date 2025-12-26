const express = require('express');
const router = express.Router();
const {protect, authorize} = require ('../middleware/authMiddleware'); 

const {createProject,
        getMyProject, 
        getProjectById,
        updateProject, 
        deleteProject, 
        addPhase, 
        updatePhase, 
        deletePhase, 
        searchProject
        } = require ('../controllers/projectPromoController');


router.get('/search', searchProject);
router.get('/mes-projets', protect, authorize('promoteur'), getMyProject);
router.get('/mes-projets/:id', protect, authorize('promoteur'), getProjectById);

router.post('/mes-projets', protect, authorize('promoteur'), createProject);
router.put('/mes-projets/:id', protect, authorize('promoteur'), updateProject);
router.delete('/mes-projets/:id', protect, authorize('promoteur'), deleteProject);

router.post('/mes-projets/:id/phases', protect, authorize('promoteur'), addPhase);
router.put('/mes-projets/:id/phases/:phaseId', protect, authorize('promoteur'), updatePhase);
router.delete('/mes-projets/:id/phases/:phaseId', protect, authorize('promoteur'), deletePhase);

module.exports = router;