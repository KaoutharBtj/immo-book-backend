const User = require ('../models/User');
const Project = require('../models/Project');

module.exports.addFavoris = async(req, res) => {
    try{

        const project = await Project.findById(req.body.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Projet non trouvé"
            });
        }

        const favoris = await Project.findByIdAndUpdate(req.body.projectId,
            { $addToSet:  {favoris: req.user.id} }, 
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: "Project est bien ajoutée aux favoris",
            data: favoris
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreurs lors de l'ajoue aux favoris",
            error: error.message
        });
    }
}

module.exports.removeFavoris = async(req, res) => {
    try{

        const serchProjectFavoris = await Project.findOne({ _id: req.params.projectId,  favoris: req.user.id });

        if (!serchProjectFavoris) {
            return res.status(404).json({
                success: false,
                message: "Ce projet n'est pas trouvée aux favoris"
            });
        }

        const favoris = await Project.findByIdAndUpdate(req.params.projectId, {
            $pull: {favoris: req.user.id}
        }, {new: true});

        return res.status(200).json({
            success: true,
            message: "ce Projet est bien suuprimer de favoris",
            data: favoris
        });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreu lors de souppression de projet aus favoris",
            error: error.message
        });
    }
}

module.exports.getMyFavoris = async(req, res) => {
    try{

        const favoris = await Project.find({favoris: req.user.id});
        if (favoris.length === 0) {
            return res.status(200).json({
                success: false,
                message: "Vous n'avez ajouté aucun projet aux favoris."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Voici votre Favoris",
            data: favoris 
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'affichage de favoris",
            error: error.message
        });
    }
}
