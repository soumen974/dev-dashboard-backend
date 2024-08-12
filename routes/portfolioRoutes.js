const express = require('express');
const router = express.Router();
const authenticateToken=require('../middlewares/authenticateToken')
const {  deletePortfolio, updatePortfolio, getPortfolioByDevId, createPortfolio} = require('../controllers/portfolioController');

router.post('/createPortfolio',authenticateToken, createPortfolio);
router.get('/getPortfolioByDevId', getPortfolioByDevId);
router.put('/updatePortfolio',authenticateToken, updatePortfolio);
router.delete('/deletePortfolio',authenticateToken, deletePortfolio);


module.exports = router;


