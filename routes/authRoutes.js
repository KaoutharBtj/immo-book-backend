const express = require('express');
const router = express.Router();
const { signup, login, getMe, verifyEmail, resendVerificationCode, selectRole, switchRole, logout } = require('../controllers/authController')
const {protect, authorize} = require ('../middleware/authMiddleware')


router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-email', resendVerificationCode);
router.post('/select-role', selectRole);

router.get('/me', protect, getMe);
router.post('/switch-role', protect, switchRole);
router.post('/logout', protect, logout)

module.exports = router;    



