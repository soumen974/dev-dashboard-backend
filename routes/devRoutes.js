const express = require('express');
const {getAlldevs,getUserById,updateUserById}=require('../controllers/devController');
const authenticateToken=require('../middlewares/authenticateToken');
const router=express.Router();

router.get('/all',getAlldevs);
router.get('/one',authenticateToken,getUserById);
router.put('/update',authenticateToken,updateUserById);

module.exports=router;