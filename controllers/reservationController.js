const User = require('../models/User');
const Project = require('../models/Project');
const Reservation = require('../models/Reservation');

module.exports.createReservation = async(req, res) => {
    try {
        if(req.user.roles !== 'client_physique' && req.user.roles != 'client_entreprise') {
            return res.status(403).json({
                success: false,
                message: "Seuls les clients peuvent reservés"
            });
        }

        const project = await Project.findById(req.body.projectId);
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

        const reservation = await Reservation.create({
            client: req.user.id,
            project: req.body.projectId,
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

        if (req.user.roles !== 'client_physique' && req.user.roles !== 'client_entreprise') {
            return res.status(401).json({
                success: false,
                message: " Seul les client peuvent voir leurs réservations"
            });
        }

        const reservation = await Reservation.find({client: req.user.id})
        .populate('project', 'titre prix localisation imagePrincipale statut');

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

        if (req.user.roles !== 'promoteur') {
            return res.status(401).json({
                success: false,
                message: 'Seuls les promoteur peuvent approver une réservation'
            });
        }

        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Réservation non trouvée'
            });
        }

        const project = await Project.findById(reservation.project);

        if (project.promoteur.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Seul le promoteur de cet projet peut approuver'
            });
        }

        if (reservation.statut !== 'en attente' ) {
            return res.status(400).json({
                success: false,
                message: 'Cette réservation est déjà traitée'
            });
        }

        reservation.statut = 'acceptée'
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

        if (req.user.roles !== 'promoteur') {
            return res.status(401).json({
                success: false,
                message: "Seul les promoteurs peuvent refuser une réservation "
            });
        }

        
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

