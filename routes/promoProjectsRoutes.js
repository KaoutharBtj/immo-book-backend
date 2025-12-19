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
router.get('/:id', getProjectById);

router.post('/', protect, authorize, createProject);
router.get('/mes-projets', protect, authorize, getMyProject);
router.put('/:id', protect, authorize, updateProject);
router.delete('/:id', protect, authorize, deleteProject);

router.post('/:id/phases', protect, authorize, addPhase);
router.put('/:id/phases/:phaseId', protect, authorize, updatePhase);
router.delete('/:id/phases/:phaseId', protect, authorize, deletePhase);

module.exports = router;