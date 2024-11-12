const express = require('express');
const {
  getTrackInfoPublic,
  createOrUpdateTrack,
  getTrackInfo,
  deleteTrackInfo
} = require('../controllers/TrackController');
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware for authentication

const router = express.Router();

router.post('/track', authenticateToken, createOrUpdateTrack);
router.get('/track/:username', getTrackInfoPublic);
router.get('/track', authenticateToken, getTrackInfo);
router.delete('/track', authenticateToken, deleteTrackInfo);

module.exports = router;
