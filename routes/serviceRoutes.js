const express=require('express');
const {createService,getServices,updateService,deleteService}=require('../controllers/serviceController');
const authenticateToken=require('../middlewares/authenticateToken');
const router=express.Router();

router.post('/service',authenticateToken,createService);
router.get('/service',authenticateToken,getServices);
router.put('/service/:id',authenticateToken,updateService);
router.delete('/service/:id',authenticateToken,deleteService);

module.exports=router;