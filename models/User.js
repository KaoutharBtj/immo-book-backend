const mongoose = require('mongoose');
const {isEmail} = require('validator')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nom : {
        type: String,
        required: [true, 'Veuillez entrer un nom'],
        trim: true
    },

    telephone: {
        type: String,
        required:[true, 'Veuillez entrer votre numéro de téléphone'],
        unique: true,
        match: [/^\+?\d{10,15}$/, 'Veuillez entrer un numéro valide'] 
    },

    email: {
        type: String,
        required: [true, 'Veuillez entrer un email'],
        lowercase: true,
        unique: true,
        validate: [isEmail, 'Veuillez saisir une adresse e-mail valide']
    },
    password: {
        type: String,   
        required: true,
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    }
})

userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('user', userSchema);

module.exports = User;




