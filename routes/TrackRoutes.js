const express = require('express');
const {
  createOrUpdateTrack,
  getTrackInfo,
  deleteTrackInfo
} = require('../controllers/TrackController');
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware for authentication

const router = express.Router();

// POST: Create or update track information for a user
router.post('/track', authenticateToken, createOrUpdateTrack);

// GET: Retrieve track information for a user
router.get('/track', authenticateToken, getTrackInfo);

// DELETE: Delete track information for a user
router.delete('/track', authenticateToken, deleteTrackInfo);

module.exports = router;
