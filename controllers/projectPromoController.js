const User = require('../models/User');
const Project = require('../models/Project'); 

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

        // Vérifier que l'image a été uploadée
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
        console.error('❌ Erreur récupération projets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des projets',
            error: error.message
        });
    }
};

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

        res.status(200).json({
            success: true,
            project
        });
    }catch(error) {
        console.error('❌ Erreur récupération projet:', error);
        res.status(500).json({
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