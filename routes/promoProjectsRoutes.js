const express = require('express');
const router = express.Router();
const {protect, authorize} = require ('../middleware/authMiddleware'); 
const upload = require('../middleware/upload');

const {createProject,
        getMyProject, 
        getProjectById,
        updateProject, 
        deleteProject, 
        addPhase, 
        updatePhase, 
        deletePhase, 
        addImageToPhase,
        deleteImageFromPhase,
        searchProject,
        addImagesToGallery,
        deleteImageFromGallery
        } = require ('../controllers/projectPromoController');


router.get('/search', searchProject);
router.get('/mes-projets', protect, authorize('promoteur'), getMyProject);
router.get('/mes-projets/:id', protect, authorize('promoteur'), getProjectById);

router.post('/mes-projets', protect,upload.single('imagePrincipale'), authorize('promoteur'), createProject);
router.post('/mes-projets/:id/galerie', protect, upload.array('images', 10), addImagesToGallery);
router.put('/mes-projets/:id', protect, authorize('promoteur'), updateProject);
router.delete('/mes-projets/:id', protect, authorize('promoteur'), deleteProject);
router.delete('/mes-projets/:id/galerie/', protect, authorize('promoteur'), deleteImageFromGallery);

router.post('/mes-projets/:id/phases', protect,upload.array('images', 10), authorize('promoteur'), addPhase);
router.post('/mes-projets/:id/phases/:phaseId', protect,upload.array('images', 10), authorize('promoteur'), addImageToPhase);
router.delete('/mes-projets/:projectId/phases/:phaseId/images', protect,authorize('promoteur'), deleteImageFromPhase);
router.put('/mes-projets/:id/phases/:phaseId', protect, authorize('promoteur'), updatePhase);
router.delete('/mes-projets/:id/phases/:phaseId', protect, authorize('promoteur'), deletePhase);

module.exports = router;