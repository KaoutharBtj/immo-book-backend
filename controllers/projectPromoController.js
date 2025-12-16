const Project = require('../models/Project'); 
const User = require('../models/User');

module.exports.createProject = async (req, res) => {
    try {
        if(!req.user.roles.includes('promoteur')) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les promoteurs peuvent créer des projets'
            });
        }

        const projectData = {
            ...req.body,
            promoteur: req.user._id
        };

        const project = await Project.create(projectData);

        res.status(201).json({
            success: true,
            message:  'Projet créé avec succès',
            project
        });
    }catch(error) {
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

        const projects = await Project.find(query)
        .sort({createdAt: -1})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

        const count = await Project.countDocuments(query);

        res.status(200).json({
            success: true,
            projects,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
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
