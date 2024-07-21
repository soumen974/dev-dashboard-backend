const express = require('express');
const authenticate =require('../middlewares/authenticateToken');
const {getAllDevs,getUserById,updateUserById}=require('../controllers/devController');
const authenticateToken=require('../middlewares/authenticateToken');
const router=express.Router();

router.get('/all',getAllDevs);
router.get('/one',authenticateToken,getUserById);
router.put('/update',authenticateToken,updateUserById);

module.exports=router;