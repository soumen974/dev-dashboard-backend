const express = require('express');
const router = express.Router();
const {
  createExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  addLearning,
  addSkill,
  removeLearning,
  removeSkill
} = require('../controllers/recentExperienceController');
const authenticateToken = require('../middlewares/authenticateToken'); 

// Create a new recent experience
router.post('/', authenticateToken, createExperience);

// Get all recent experiences for the authenticated user
router.get('/', authenticateToken, getAllExperiences);

// Get a specific recent experience by ID
router.get('/:id', authenticateToken, getExperienceById);

// Update an experience by ID
router.put('/:id', authenticateToken, updateExperience);

// Delete an experience by ID
router.delete('/:id', authenticateToken, deleteExperience);

// Add a new learning to a specific experience by ID
router.post('/:id/learnings', authenticateToken, addLearning);

// Add a new skill to a specific experience by ID
router.post('/:id/skills', authenticateToken, addSkill);

// Remove a learning from a specific experience by experience ID and learning ID
router.delete('/:id/learnings/:learningId', authenticateToken, removeLearning);

// Remove a skill from a specific experience by experience ID and skill ID
router.delete('/:id/skills/:skillId', authenticateToken, removeSkill);

module.exports = router;
