const User = require('../models/User');
const Project = require('../models/Project');

module.exports.getAllProjects = async (req, res) => {

    try{
        const user = await User.findById(req.user.id);
        if (!user) {
            return  res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
            });
        }

        if (user.roles !== 'client_physique' && user.roles !== 'client_entreprise') {
            return res.status(403).json({
                success: false,
                message: 'Vous n`avez pas le droit de voir toutes les projet'
            });
        }

        const projects = await Project.find({actif: true})
        .populate('promoteur', 'nomEntreprise numeroRC email telephone ')
        .sort({ createdAt: -1});

        const projectsWithStars = await Promise.all(
            projects.map( async (project) =>{ 
                    const reviews = await Review.aggregate([
                        {$match: {project: project._id}},
                        {$group: {_id: null, averageStars: { $avg: '$stars'}, totalReviews: {$sum: 1}}}
                    ]);

                return {
                ...project.toObject(),
                averageStars: reviews.length > 0? reviews[0].averageStars.toFixed(1) : null,
                totalReviews: reviews.length > 0? reviews[0].totalReviews : 0
                };
            })
        );

        return res.status(200).json({
            success: true,
            count: projectsWithStars.length,
            data: projectsWithStars
        })

    }catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }


}