const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const mongoose = require('mongoose');

module.exports.getAllProjects = async (req, res) => {

    try{
        const user = await User.findById(req.user.id);
        if (!user) {
            return  res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
            });
        }

        const projects = await Project.find({actif: true})
        .populate('promoteur')
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
            data: projectsWithStars
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.getProjectById = async(req, res) => {
    try{

        if (!mongoose.Types.bjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        const project = await Project.findById(req.params.id)
        .populate('promoteur');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "ce projet n'existe pas"
            });
        }

        project.vues +=1;
        await project.save();

        return res.status(200).json({
            success: true,
            project
        });
    }catch(error) {
        
        return res.status(500).json({
            success:false,
            message: "Erreur lors de la récupération du projet",
            error: error.message
        });
    }

}