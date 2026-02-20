const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, { timestamps: true})

reviewSchema.index({ client: 1, project: 1 }, {unique: true});

module.exports = mongoose.model('Review', reviewSchema);