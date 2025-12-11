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

const handleErrors = (err) => {
    console.log(err.message, err.code);

    let errors = {nom: '', telephone: '',  email: '', password: ''};
    if (err.code === 11000) {
        errors.email = 'Cet e-mail existe déjà';
        return errors;
    }
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}



module.exports.signup_get = (req, res) => {
    res.json({ message: "Get signup route" });
}

module.exports.login_get = (req, res) => {
    res.json({ message: "get login route" });
}

module.exports.signup_post = async (req, res) => {
    const { nom,telephone,email, password } = req.body;
    
    try{
        const user = await User.create({ nom,telephone,email, password });
        res.status(201).json(user);
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.login_post = (req, res) => {
    const { nom, telephone, email, password  } = req.body;
    console.log(email, password);
    res.json({ message: "post login route" });
}
