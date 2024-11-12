const express = require('express');
const {  
    getProjectsByUsernamePublic,
    createProject,
    getProjectsByUsername,
    updateProject,
    deleteProject,
    addLearning,
    addSkills,
    deleteLearning,
    deleteSkill } = require('../controllers/projectController');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { storage } = require('../services/cloudinary');
const upload = multer({ storage });
const router = express.Router();


// Create a new project
router.post('/project', authenticateToken, upload.fields([{ name: 'thumbNailImage' }]), createProject);

// Get all projects for a user
router.get('/project', authenticateToken, getProjectsByUsername);

// Update a project by ID
router.put('/project/:id', authenticateToken, upload.fields([{ name: 'thumbNailImage' }]), updateProject);

// Delete a project by ID
router.delete('/project/:id', authenticateToken, deleteProject);

router.post('/project/:id/learnings', authenticateToken, addLearning);

// Add a new skill to a specific experience by ID
router.post('/project/:id/skills', authenticateToken, addSkills);

// Remove a learning from a specific experience by experience ID and learning ID
router.delete('/project/:id/learnings/:learningId', authenticateToken, deleteLearning);

// Remove a skill from a specific experience by experience ID and skill ID
router.delete('/project/:id/skills/:skillId', authenticateToken, deleteSkill);

router.get('/project/:username',  getProjectsByUsernamePublic);



module.exports = router;
