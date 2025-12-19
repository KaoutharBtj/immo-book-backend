const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {

    try{
        let token;
        if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.header.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé. Token manquant.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if(!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Compte désactivé'
            })
        }

        if(decoded.currentRole && !user.roles.includes(decoded.currentRole)) {
            return res.status(401).json({
                success: false,
                message: 'Rôle de session invalide'
            })
        }

        req.user = user;
        req.currentRole = decoded.currentRole;
        next();
    }catch(error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }


}

exports.authorize = ( ...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.currentRole)) {
            return res.status(403).json({
                success: false,
                message: `Le rôle ${req.currentRole} n'est pas autorisé à accéder à cette ressource`
            });
            
        }
        next();
    }
}