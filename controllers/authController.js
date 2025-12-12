const { Server } = require('http');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId, currentRole) => {
    return jwt.sign(
        {
            userId,
            currentRole
        },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE || '7d'}
    );
};

module.exports.signup = async (req, res) => {
    try{
        const { telephone,email, password, roles, typeCompte, nom, nomEntreprise, numeroRC } = req.body;

        if(!['physique', 'entreprise'].includes(typeCompte)) {
            return res.status(400).json({
                success: false,
                message: 'Type de compte invalide. Choisissez physique ou entreprise'
            });
        }

        const existingUser= await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            })
        }

        if(typeCompte === 'entreprise' && numeroRC)  {
            const existingRC = await User.findOne({numeroRC});
            if (existingRC) {
                return res.status(400).json({
                    success: false,
                    message:'Ce numéro RC est déjà utilisé'
                });
            }
        }

        let userData = { email, password, telephone, typeCompte, roles: [] }

        if (typeCompte === 'physique') {
            if (!nom) {
                return res.status(400).json({
                    success: false,
                    message: 'Le nom est requis pour un client physique'
                });
            }

            userData.roles = ['client_physique'];
            userData.nom = nom;
        }


        else if(typeCompte === 'entreprise') {
            if(!numeroRC ||!nomEntreprise ) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom d\'entreprise, numéro RC sont requis pour une entreprise'
                });
            }

            userData.roles = ['promoteur', 'client_entreprise'];
            userData.nomEntreprise = nomEntreprise;
            userData.numeroRC = numeroRC;
        }

        const user = await User.create(userData);

        let token = null;
        if (typeCompte === 'physique') {
            token = generateToken(user._id, 'client_physique');
        }

        res.status(201).json({
            success: true,
            meassge: 'Inscription réussie',
            token,
            needRoleSelection: typeCompte === 'entreprise',
            user:{
                id: user._id,
                email: user.email,
                typeCompte: user.typeCompte,
                nom: user.nom,
                nomEntreprise: user.nomEntreprise

            }
        })

    }
    catch(error) {
        if(error.name === 'ValidationError') {
            const message = Object.values(error.erros).map(err => err.message);
            return res.status(400).json({
                succes: false,
                message: 'Erreur de validation',
                errors: message
            });
        }

        res.status(500).json({
        succes: false,
        message: 'Erreur serveur lors de l\'inscription',
        error: error.message
        })
    }
}

module.exports.login = async (req, res) => {
    try{
        const { email, password  } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe sont requis'
            })
        }

        const user = await User.findOne({email}).select('+password');

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        if(! user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Votre compte est désactivé'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        if( user.roles.length > 1) {
            return res.status(200).json({
                success: true,
                needRoleSelection: true,
                message: 'Veuillez choisir votre rôle pour cette session',
                availableRoles: user.roles,
                userId: user._id,
                user:{
                    id: user._id,
                    email: user.email,
                    typeCompte: user.typeCompte,
                    nom: user.nom,
                    nomEntreprise: user.nomEntreprise
                }
            })
        }
        const token = generateToken(user._id, user.roles[0]);

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token, 
            currentRole: user.roles[0],
            user:{
                id: user._id,
                email: user.email,
                typeCompte: user.typeCompte,
                roles: user.roles[0],
                nom: user.nom,
                nomEntreprise: user.nomEntreprise
            }
        })
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion',
            error: error.message
        });
    }
}

module.exports.selectRole  = async (req, res) => {
    try{
        const {userId, selectedRole} = req.body;

        if(!userId || !selectedRole) {
            return res.status(400).json({
                success: false,
                message: 'userId et selectedRole sont requis'
            });
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const token = generateToken(user._id, selectedRole);

        res.status(200).json({
            success: true,
            message: 'Rôle sélectionné avec succès',
            token, 
            currentRole: selectedRole,
            user:{
                id: user._id,
                email: user.email,
                typeCompte: user.typeCompte,
                roles: user.roles,
                nom: user.nom,
                nomEntreprise: user.nomEntreprise
            }
        });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la sélection du rôle',
            error: error.message
        });
    }
}

module.exports.switchRole = (req, res) => {
    try{
        const {newRole} = req.body;

        if(!newRole) {
            return res.status(400).json({
                success: false,
                message: 'Le nouveau rôle est requis'
            });
        }

        if (!req.user.roles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Ce rôle n\'est pas disponible pour votre compte'
            });
        }

        const token = generateToken(req.user._id, newRole);

        res.status(200).json({
            success: true,
            message: 'Rôle changé avec succès',
            token,
            currentRole: newRole,
            availableRoles: req.user.roles
        });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de rôle',
            error: error.message
        });
    }
}

module.exports.getMe = (req, res) => {
    try{
        res.status(200).json({
        success: true,
        user: req.user,
        currentRole: req.currentRole,
        availibleRole: req.user.roles
    });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        })
    }
    
}

module.exports.logout= (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
    });
}