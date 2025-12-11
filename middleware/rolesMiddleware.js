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
