const mongoose = require('mongoose');
const reservationSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,

        ref:'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        enum: ['en attente', 'acceptée', 'refusée'],
        default: 'en attente'
    }
}, { timestamps: true })

module.exports = mongoose.model('Reservation', reservationSchema);