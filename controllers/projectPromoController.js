const User = require('../models/User');
const Project = require('../models/Project'); 
const fs = require('fs');
const path = require('path');


module.exports.createProject = async (req, res) => {
    try {

        if(!req.user.roles.includes('promoteur')) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les promoteurs peuvent créer des projets'
            });
        }

        console.log('Body reçu:', req.body);
        console.log('Fichier reçu:', req.file);

        const {
            titre,
            description,
            typeBien,
            statut,
            prix,
            dateDebut,
            dateFinPrevue,
            adresse,
            ville,
            codePostal,
            quartier,
            latitude,
            longitude,
            surfaceTotale,
            nombreChambres,
            nombreSallesBain,
            nombreSallesEau,
            etage,
            ascenseur,
            balcon,
            terrasse,
            garage,
            jardin,
            piscine,
            climatisation,
            chauffage,
            cuisine,
            meuble,
            securite,
            gardien
        } = req.body;


        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'L\'image principale est requise'
            });
        }

        // Construire le chemin de l'image
        const imagePrincipale = `uploads/${req.file.filename}`;

        // Créer le projet
        const nouveauProjet = await Project.create({
            titre,
            description,
            typeBien,
            statut,
            prix: Number(prix),
            dateDebut,
            dateFinPrevue: dateFinPrevue || undefined,
            imagePrincipale,
            galerie: [],
            localisation: {
                adresse: adresse,
                ville: ville,
                codePostal: codePostal || '',
                quartier: quartier,
                coordinates: {
                    latitude: Number(latitude),
                    longitude: Number(longitude)
                }
            },
            surfaceTotale: Number(surfaceTotale),
            caracteristiques: {
                surfaceTotale: Number(surfaceTotale),
                nombreChambres: Number(nombreChambres) || 0,
                nombreSallesBain: Number(nombreSallesBain) || 0,
                nombreSallesEau: Number(nombreSallesEau) || 0,
                etage: Number(etage) || 0,
                ascenseur: ascenseur === 'true',
                balcon: balcon === 'true',
                terrasse: terrasse === 'true',
                garage: garage === 'true',
                jardin: jardin === 'true',
                piscine: piscine === 'true',
                climatisation: climatisation === 'true',
                chauffage: chauffage === 'true',
                cuisine: cuisine || 'non_equipee',
                meuble: meuble === 'true',
                securite: securite === 'true',
                gardien: gardien === 'true'
            },
            promoteur: req.user._id 
        });

        res.status(201).json({
            success: true,
            message: 'Projet créé avec succès',
            project: nouveauProjet
        });

    } catch(error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                error: messages
            });
        }

        console.log('Erreur création projet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du projet',
            error: error.message
        });
    }
}


module.exports.getMyProject = async (req, res) => {
    try {
        const { statut, typeBien, page = 1, limit = 10 } = req.query;
        const query = {promoteur: req.user._id};

        if (statut) query.statut= statut;
        if (typeBien) query.typeBien = typeBien;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const projects = await Project.find(query)
        .sort({createdAt: -1})
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .select('-__v');

        const count = await Project.countDocuments(query);

        res.status(200).json({
            success: true,
            projects,
            totalPages: Math.ceil(count / limitNumber),
            currentPage: pageNumber,
            total: count
        });     
    }catch (error) {
        console.error('Erreur récupération projets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
}

module.exports.getProjectById = async (req, res) => {

    try {
        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: `l'Accès Non autorisé à ce projet`
            });
        }

        project.vues += 1;
        await project.save();

        return res.status(200).json({
            success: true,
            project
        });
    }catch(error) {
        console.error(' Erreur récupération projet:', error);
        return res.status(500).json({
            success: false,
            message:'Erreur lors de la récupération du projet',
            error: error.message
        });
    }
}

module.exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if(!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à modifier ce projet'
            });
        }

        project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        return res.status(200).json({
            success: true,
            message : 'Projet mis à jour avec succès',
            project
        });

    }catch(error) {
        if(error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                error: messages
            });
        }

        console.log('❌ Erreur mise à jour projet:', error);
        res.status(500).json({
            success: false,
            message:'Erreur lors de la mise à jour du projet',
            error: error.message
        });
    }
}

module.exports.deleteProject = async (req, res) => {

    try {

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à supprimer ce projet'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Projet supprimé avec succès'
        });
    }catch(error) {
        console.log('Erreur suppression projet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du projet',
                error: error.message
            });
    }
}

module.exports.addPhase = async (req, res) => {

    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à modifier ce projet'
            });
        }

        const { titre, description, dateDebut, dateFin, images, statut } = req.body;

        const numeroPhase = project.phases.length + 1;

        const nouvellePhase = {
            numero: numeroPhase,
            titre,
            description,
            dateDebut,
            dateFin,
            images: images || [],
            statut: statut || 'non_commence'
        };

        project.phases.push(nouvellePhase);
        await project.save();

        res.status(201).json({
            success: true,
            message: 'Phase ajoutée avec succès',
            phase: project.phases[project.phases.length - 1]
        });
    }catch(error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);

            res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                error: messages
            });
        }

        console.log('Erreur ajout phase:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la phase',
            error: error.message
        });
    }
}

module.exports.updatePhase = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if(!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if(project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à modifier ce projet'
            });
        }

        const phase = project.phases.id(req.params.phaseId);

        if (!phase) {
            return res.status(404).json({
                success: false,
                message: 'Phase non trouvée'
            });
        }

        Object.keys(req.body).forEach(key => {
            phase[key] = req.body[key];
        });

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Phase mise à jour avec succès',
            phase
        });
    }catch (error) {
        console.error('Erreur mise à jour phase:', error);
        res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la phase',
        error: error.message
        });
    }
}

module.exports.deletePhase = async  (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Projet non trouvé'
                });
            }

            if (project.promoteur.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à modifier ce projet'
                });
            }

            project.phases.pull(req.params.phaseId);
            await project.save();

            res.status(200).json({
            success: true,
            message: 'Phase supprimée avec succès',
            });

        }catch (error) {
            console.error('Erreur suppression phase:', error);
            res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la phase',
            error: error.message
            });
        }
}

module.exports.searchProject = async (req, res) => {
        try{
            const { typeBien, ville, prixMin, prixMax, surfaceMin, surfaceMax, nombreChambres, statut, page = 1, limit = 10 } = req.query;

            const query = {actif: true};
            
            if (typeBien) query.typeBien = typeBien;
            if (ville) query['localisation.ville'] = new RegExp(ville, 'i');
            if (prixMin || prixMax) {
                query.prix = {};
                if (prixMin) query.prix.$gte = prixMin;
                if (prixMax) query.prix.$lte = prixMax;
            }
            if (surfaceMin || surfaceMax) {
                query['caracteristiques.surfaceTotale'] = {};
                if (surfaceMin) query['caracteristiques.surfaceTotale'].$gte = surfaceMin;
                if (surfaceMax) query['caracteristiques.surfaceTotale'].$lte = surfaceMax;
            }
            if (nombreChambres) query['caracteristiques.nombreChambres'] = { $gte: nombreChambres };
            if (statut) query.statut = statut;

            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);

            const projects = await Project.find(query) 
                .populate('promoteur', 'client_entreprise')
                .sort({createdAt: -1})
                .limit(limitNumber)
                .skip((pageNumber - 1) * limitNumber)

            const count = await Project.countDocuments(query);
            
            
            res.status(200).json({
            success: true,
            projects,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
            });
        }catch (error) {
            console.error('Erreur recherche projets:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche',
                error: error.message
            });
        }
}

module.exports.addImagesToGallery = async (req, res) => {

        try {
            const { id } = req.params;

            console.log('=== AJOUT IMAGES GALERIE ===');
            console.log('Projet ID:', id);
            console.log('Fichiers reçus:', req.files);

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucune image fournie'
                })
            }

            const project = await Project.findById(id);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Projet non trouvé'
                })
            }
            if (project.promoteur.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à modifier ce projet'
                })
            }

            const newImages = req.files.map(file => `/uploads/${file.filename}`);


            if ((project.galerie?.length || 0) + newImages.length > 10) {
                newImages.forEach(imgPath => {
                    const filepath =    path.join(__dirname, '..', imgPath);
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                    }
                });

                return res.status(400).json({
                    success: false,
                    message: `la galerie ne peut contenir que 10 images maximum (actuellement ${project.galerie.length - newImages.length})`
                });
            }

            console.log('GALERIE AVANT SAVE:', project.galerie)
            project.galerie = [...(project.galerie || []), ...newImages];
            await project.save();
            console.log('Save est bien atteite');

            res.status(200).json({
                success: true,
                message: `${newImages.length} images ajoutées avec succès`,
                galerie: project.galerie
            });
                
        }  catch(error) {
            console.log('Erreur ajout images galerie:', error);

            res.status(500).json({
                success: false,
                message:  'Erreur lors de l\'ajout des images',
                error: error.message
            });
        }
}

module.exports.deleteImageFromGallery = async(req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl} = req.body;

        console.log('=== SUPPRESSION IMAGE GALERIE ===');
        console.log('Projet ID:', id);
        console.log('Image à supprimer:', imageUrl);

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL de l\'image requise'
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Projet non trouvé'
            });
        }

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à modifier ce projet'
            });
        }

        if (!project.galerie.includes(imageUrl)) {
            return res.status(404).json({
                success: false,
                message: 'Image non trouvée dans la galerie'
            });
        }

        project.galerie = project.galerie.filter(img => img !== imageUrl);
        const filepath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log('Fichier physique supprimé:', filepath);
        }else {
            console.log('Fichier physique non trouvé:', filepath);
        }

        await project.save();

        console.log('Image supprimée de la galerie');
        console.log('Nouvelle galerie:', project.galerie);

        res.status(200).json({
            success: true,
            message: 'Image supprimée avec succès',
            galerie: project.galerie
        });
    } catch (error) {
        console.log('Erreur de suppression image', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'image',
            error: error.message
        });
    }
};