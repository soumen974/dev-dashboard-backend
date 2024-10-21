const express=require('express');
const {createOrUpdateSocials,getSocialsInfo,deleteSocialsInfo}=require('../controllers/socialController');
const authenticateToken=require('../middlewares/authenticateToken');

const router=express.Router();

router.post('/socials',authenticateToken,createOrUpdateSocials);
router.get('/socials',authenticateToken,getSocialsInfo);
router.delete('/socials',authenticateToken,deleteSocialsInfo);

module.exports=router;