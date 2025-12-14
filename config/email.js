const nodemailer = require('nodemailer');

const createTransporter = () => {
return nodemailer.createTransport({
    host: process.env.SMTP_HOST,       
    port: process.env.SMTP_PORT,        
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

};


const sendVerificationEmail = async (email, code, userName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Vérifiez votre compte ImmoBook',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1d4370; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
                    .code-box { 
                    background-color: #fff; 
                    border: 2px dashed #1d4370; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 32px; 
                    font-weight: bold; 
                    letter-spacing: 5px;
                    margin: 20px 0;
                    color: #1d4370;
                    }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
                </style>
                </head>
                <body>
                <div class="container">
                    <div class="header">
                    <h1>ImmoBook</h1>
                    </div>
                    <div class="content">
                    <h2>Bonjour ${userName || 'Utilisateur'} </h2>
                    <p>Merci de vous être inscrit sur ImmoBook ! Pour activer votre compte, veuillez entrer le code de vérification suivant :</p>
                    
                    <div class="code-box">
                        ${code}
                    </div>
                    
                    <p><strong>Ce code est valide pendant 10 minutes.</strong></p>
                    
                    <p class="warning">
                        Si vous n'avez pas créé de compte sur ImmoBook, ignorez cet email.
                    </p>
                    </div>
                    <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ImmoBook. Tous droits réservés.</p>
                    </div>
                </div>
            </body>
            </html>
        `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé:', info.messageId);
        return { success: true, messageId: info.messageId };

} catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
}
};


const resendVerificationEmail = async (email, code, userName) => {
    return await sendVerificationEmail(email, code, userName);
};

module.exports = {
    sendVerificationEmail,
    resendVerificationEmail
};