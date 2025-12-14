const { Server } = require('http');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../config/email');

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
        const { telephone,email, password, typeCompte, nom, nomEntreprise, numeroRC } = req.body;

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

        if(typeCompte === 'entreprise')  {
            const existingRC = await User.findOne({numeroRC});
            if (existingRC) {
                return res.status(400).json({
                    success: false,
                    message:'Ce numéro RC est déjà utilisé'
                });
            }
        }

        let userData = { email, password, telephone, typeCompte, roles: [], isVerified: false }

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
        const verificationCode = user.generateVerificationCode(); 
        console.log('Code de vérification généré:', verificationCode);
        await user.save();

        const emailResult = await sendVerificationEmail(
            user.email,
            verificationCode,
            user.nom || user.nomEntreprise
        );

        if (!emailResult.success) {
            console.error('Erreur envoi email:', emailResult.error);
        }



        let token = null;
        if (typeCompte === 'physique') {
            token = generateToken(user._id, 'client_physique');
        }

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            needVerification: true,
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
            const message = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors: message
            });
        }

        res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'inscription',
        error: error.message
        });
    }
}

module.exports.verifyEmail = async (req, res) => {
    try{
        const {userId, code} = req.body;

        if( !userId || !code) {
            return res.status(400).json({
                success:  false,
                message: 'userId et code sont requis'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }


        if(user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Ce compte est déjà vérifié'
            });
        }

        const verificationResult = user.verifyCode(code);

        if(!verificationResult.success) {
            return res.status(400).json({
                success: false,
                message: verificationResult.message
            });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;
        user.verificationCodeAttempt = 0;
        await user.save();  
        
        let token = null;
        if (user.typeCompte === 'physique') {
            token = generateToken(user._id, 'client_physique');
        }

        res.status(200).json({
            success: true,
            message: 'Email vérifié avec succès !',
            token,
            needRoleSelection: user.typeCompte === 'entreprise',
            user: {
                id: user._id,
                email: user.email,
                typeCompte : user.typeCompte,
                roles: user.roles,
                nom: user.nom,
                nomEntreprise: user.nomEntreprise,
                isVerified: user.isVerified
            }
        });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    } 
}

module.exports.resendVerificationCode= async (req, res) => {
    try{
        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId est requis'
            });
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if(user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Ce compte est déjà vérifié'
            });
        }

        const newCode = user.generateVerificationCode();
        await user.save();

        const emailResult = await sendVerificationEmail(
            user.email,
            newCode,
            user.nom || user.nomEntreprise
        );

        if(!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi de l\'email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Un nouveau code a été envoyé à votre email'
        });
    }catch(error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
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

        if(!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Veuillez vérifier votre email avant de vous connecter',
                needVerification: true,
                userId: user._id,
                email: user.email
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