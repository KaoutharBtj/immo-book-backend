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
router.get('/:id', protect, authorize('promoteur'), getProjectById);

router.post('/', protect, authorize('promoteur'), createProject);
router.put('/:id', protect, authorize('promoteur'), updateProject);
router.delete('/:id', protect, authorize('promoteur'), deleteProject);

router.post('/:id/phases', protect, authorize('promoteur'), addPhase);
router.put('/:id/phases/:phaseId', protect, authorize('promoteur'), updatePhase);
router.delete('/:id/phases/:phaseId', protect, authorize('promoteur'), deletePhase);

module.exports = router;