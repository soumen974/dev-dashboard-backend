const express=require('express');
const {getSocialsInfoPublic,createOrUpdateSocials,getSocialsInfo,deleteSocialsInfo}=require('../controllers/socialController');
const authenticateToken=require('../middlewares/authenticateToken');

const router=express.Router();

router.post('/socials',authenticateToken,createOrUpdateSocials);
router.get('/socials',authenticateToken,getSocialsInfo);
router.delete('/socials',authenticateToken,deleteSocialsInfo);

router.get('/socials/:username',authenticateToken,getSocialsInfoPublic);


module.exports=router;