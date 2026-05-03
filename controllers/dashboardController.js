const Project = require('../models/Project');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

module.exports.getPromoStats = async (req, res) => {
    try {
        const promoteurId = req.user.id;

        // Get all projects of this promoteur
        const projects = await Project.find({ promoteur: promoteurId });
        const projectIds = projects.map(p => p._id);

        // Get all reservations for these projects
        const reservations = await Reservation.find({ project: { $in: projectIds } })
            .populate('client', 'nom prenom email')
            .populate('project', 'titre imagePrincipale prix')
            .sort({ createdAt: -1 });

        // Get all reviews
        const reviews = await Review.find({ project: { $in: projectIds } })
            .populate('client', 'nom prenom')
            .populate('project', 'titre')
            .sort({ createdAt: -1 });

        // KPIs
        const totalProjects = projects.length;
        const totalVues = projects.reduce((acc, p) => acc + (p.vues || 0), 0);
        const totalReservations = reservations.length;
        const reservationsAcceptees = reservations.filter(r => r.statut === 'acceptée').length;
        const reservationsEnAttente = reservations.filter(r => r.statut === 'en attente').length;
        const reservationsRefusees = reservations.filter(r => r.statut === 'refusée').length;

        // Projects by statut
        const projectsByStatut = {
            a_venir: projects.filter(p => p.statut === 'a_venir').length,
            en_cours: projects.filter(p => p.statut === 'en_cours').length,
            termine: projects.filter(p => p.statut === 'termine').length,
            vendu: projects.filter(p => p.statut === 'vendu').length,
        };

        // Top projects by views
        const topProjectsByViews = [...projects]
            .sort((a, b) => (b.vues || 0) - (a.vues || 0))
            .slice(0, 3)
            .map(p => ({ _id: p._id, titre: p.titre, vues: p.vues, imagePrincipale: p.imagePrincipale }));

        // Reservations per project
        const reservationsPerProject = projects.map(p => ({
            titre: p.titre,
            total: reservations.filter(r => r.project._id.toString() === p._id.toString()).length
        })).filter(p => p.total > 0);

        // Average rating per project
        const averageRating = reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalProjects,
                    totalVues,
                    totalReservations,
                    reservationsAcceptees,
                    reservationsEnAttente,
                    reservationsRefusees,
                    averageRating,
                    totalReviews: reviews.length
                },
                projectsByStatut,
                topProjectsByViews,
                reservationsPerProject,
                recentReservations: reservations.slice(0, 5),
                recentReviews: reviews.slice(0, 5)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erreur lors du chargement du tableau de bord",
            error: error.message
        });
    }
};