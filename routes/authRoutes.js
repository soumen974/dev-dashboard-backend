const express = require('express');
const { register, verifyEmail, addPassword, checkUsername, login, logout, protectedRoute } = require('../controllers/authController');
// const validateRequest = require('../middlewares/validateRequest');
const validateRequest=require('../middlewares/validationRequest')
const authenticateToken=require('../middlewares/authenticateToken')
const router = express.Router();

router.post('/register', validateRequest, register);
router.post('/verify-email', verifyEmail);
router.post('/addpassword', addPassword);
router.post('/usernamecheck', checkUsername);
router.post('/login', validateRequest, login);
router.post('/logout', logout);
router.get('/protected',authenticateToken, protectedRoute);

module.exports = router;

