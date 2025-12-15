const mongoose = require('mongoose');
const {isEmail} = require('validator')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

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
    },

    roles: [{
        type: String,
        enum: ['promoteur', 'client_physique', 'client_entreprise'],
        required: true
    }],

    typeCompte: {
        type: String,
        enum: ['physique', 'entreprise'],
        required: [true, 'Le type de compte est requis']
    },

    nom: {
        type: String,
        required: function() {
            return  this.typeCompte === 'physique';
        }
    },

    nomEntreprise: {
        type: String,
        required: function() {
        return this.typeCompte === 'entreprise';
        }
    },

    numeroRC: {
        type: String,
        required: function() {
            return this.typeCompte === 'entreprise';
        },
        unique: true,
        sparse: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String,
        required: false
    },

    verificationCodeExpire: {
        type: Date,
        require: false
    },

    verificationCodeAttempt: {
        type: Number,
        default: 0
    }

},{
        timestamps: true
    })

userSchema.pre('save', async function() {  
    
    if (!this.isModified('password')) return;  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.method.hasRole = async function(role) {
    return await this.roles.includes(role);
};

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return  user;
};


userSchema.methods.generateVerificationCode = function() {
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
    this.verificationCodeAttempts = 0;
    return this.verificationCode;
}

userSchema.methods.verifyCode = function(code) {
    if (this.verificationCodeExpire < new Date()) {
        return {success: false, message: 'Le code a expiré'};
    }

    if (this.verificationCodeAttempt > 5) {
        return { success: false, message : 'Trop de tentatives. Demandez un nouveau code.' };
    }

    this.verificationCodeAttempt +=1;

    if (this.verificationCode !== code) {
        return {success: false, message: 'Code incorrect'}
    }

    return {success: true};
}


const User = mongoose.model('user', userSchema);

module.exports = User;




