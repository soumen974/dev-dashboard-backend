const express = require('express');
const { imageUpload, chat, userChats, chats } = require('../controllers/chatController');
const authenticateToken=require('../middlewares/authenticateToken')

const router = express.Router();

router.get('/upload', imageUpload);
router.post('/chats',authenticateToken , chat);
router.get('/userchats',authenticateToken, userChats);


module.exports = router;
