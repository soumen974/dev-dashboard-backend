const express = require('express');
const { register, verifyEmail, login, logout, protectedRoute,addpassword } = require('../controllers/authController');
// const validateRequest = require('../middlewares/validateRequest');
const validateRequest=require('../middlewares/validationRequest')
const authenticateToken=require('../middlewares/authenticateToken')
const router = express.Router();

router.post('/register', validateRequest, register);
router.post('/verify-email', verifyEmail);
router.post('/addpassword', addpassword);
router.post('/login', validateRequest, login);
router.post('/logout', logout);
router.get('/protected',authenticateToken, protectedRoute);

module.exports = router;
