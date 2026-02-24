const User = require('../models/User');
const Project = require('../models/Project');
const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

module.exports.createReservation = async(req, res) => {

    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        const project = await Project.findById(req.params.id);
        console.log("project Id recue:", req.params.id);
        if (!project) {
            return res.status(404).json({
                success:false,
                message: "ce project n'existe pas"
            });
        }

        if (project.statut === 'vendu') {
            return res.status(400).json({
                success: false,
                message: 'Ce projet est déjà vendu'
            });
        }

        const existingReservation = await Reservation.findOne({
            client: req.user._id,
            project: req.params.id
        });

        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: "Vous avez déjà réservé ce projet"
            });
        }

        const reservation = await Reservation.create({
            client: req.user.id,
            project: req.params.id,
            statut: 'en attente'
        });


        return res.status(201).json({
            success: true,
            message:  'Réservation envoyée au promoteur',
            data: reservation  
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de creation de réservation',
            error: error.message
        });
    }

}

module.exports.getMyReservation = async (req, res) => {
    try{
        const reservation = await Reservation.find({client: req.user.id})
        .populate('project');

        return res.status(200).json({
            success: true,
            reservation
        });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors de recupérations des réservations",
            error: error.message
        });
    }
}

module.exports.approveReservation = async(req, res) => {

    try{
        
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Réservation non trouvée'
            });
        }

        if (reservation.statut !== 'en attente' ) {
            return res.status(400).json({
                success: false,
                message: 'Cette réservation est déjà traitée'
            });
        }

        const checkReservationApproval = await Reservation.findOne({
            project: reservation.project,
            statut:'acceptée'
        });

        if(checkReservationApproval) {
            return res.status(400).json({
                success: false,
                message: "Ce projet est dèja une réservation acceptée"
            });
        }

        reservation.statut = 'acceptée';
        await reservation.save();

        return res.status(200).json({
            success: true,
            message: 'Réservation est approuvée',
            data: reservation
        });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'aprobation",
            error: error.message
        });
    }
}

module.exports.refuseReservation = async(req, res) => {

    try{
        
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Réservation non trouvée"
            });
        }


        const project = await Project.findById(reservation.project);
        if(project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Seul le promoteur de ce projet peut refuser"
            });
        }

        if(reservation.statut !== 'en attente') {
            return res.status(400).json({
                success: false,
                message: "Réservation deja traitée"
            });
        }

        reservation.statut = 'refusée';
        await reservation.save();

        return res.status(200).json({
            success: true,
            message: "Réservation refusée",
            data: reservation
        });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors de refus",
            error: error.message
        });
    }
}

