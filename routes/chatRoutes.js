const express = require('express');
const { imageUpload, chat, userChats, chats, updateChats } = require('../controllers/chatController');
const authenticateToken=require('../middlewares/authenticateToken')

const router = express.Router();

router.get('/upload', imageUpload);
router.post('/chats',authenticateToken , chat);
router.get('/userchats',authenticateToken, userChats);
router.get('/chats/:id',authenticateToken, chats);
router.put('/chats/:id',authenticateToken, updateChats);

module.exports = router;
