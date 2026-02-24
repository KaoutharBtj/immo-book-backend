const Project = require('../models/Project');
const Review = require('../models/Review');
const User = require('../models/User');
const Reservation = require('../models/Reservation');

module.exports.createReview = async (req, res) => {
    try{

        const reservation = await Reservation.findOne({
            client: req.user._id,
            project: req.params.projectId,
            statut: 'acceptée'
        });

        if(!reservation) {
            return res.status(403).json({
                success: false,
                message: "Vous devez avoir une réservation approuvée pour laisser un avis"
            });
        }

        const existingReview = await Review.findOne({
            client: req.user._id,
            project: req.params.projectId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Vous avez dèja laissé un avis pour ce projet"
            });
        }

        const review = await Review.create({
            client: req.user.id,
            project: req.params.projectId,
            stars: req.body.stars,
        });

        console.log('voici reviews',review)

        return res.status(201).json({
            success: true,
            message: "l'avis est bien envoyer",
            data: review
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoie d'avis",
            error: error.message
        });
    }


}

module.exports.getAllReview = async(req, res) => {
    try{

        const project = await Project.findById(req.params.projectId);

            if (project.promoteur.toString() !== req.user.id.toString()) {
                return res.status(401).json({
                    success: false,
                    message: "Seul le promoteur de ce projet peut consulter les avis"
                });
            }

        const reviews = await Review.findOne({project : req.params.projectId});

            if (!reviews) {
                return res.status(404).json({
                    success: false,
                    message: "Ce projet n'as aucun avis"
                });
            }


            return res.status(200).json({
                success: true,
                message: "Les avis de ce projet sont bien afficher",
                data: reviews
            });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreu lors de l'affichages des avis d'un projet",
            error: error.message
        });
    }

}