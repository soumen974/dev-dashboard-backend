const recentExperience = require('../models/recentExperience');

// CREATE a new recent experience
const createExperience = async (req, res) => {
  try {
    const newExperience = new recentExperience({
      ...req.body,
      username: req.devs.username 
    });

    if (req.files && req.files.companyLogoUrl) {
      newExperience.companyLogoUrl = req.files.companyLogoUrl[0].path;
  }

  if (req.files && req.files.relatedPDFUrl) {
    newExperience.relatedPDFUrl = req.files.relatedPDFUrl[0].path;
  }
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ all recent experiences from specific  username
const getAllExperiences = async (req, res) => {
  try {
    const experiences = await recentExperience.find({ username: req.devs.username }); 
    res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ a specific recent experience by ID from a specific username
const getExperienceById = async (req, res) => {
  try {
    const experience = await recentExperience.findOne({ _id: req.params.id, username: req.devs.username });   
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    res.status(200).json(experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE an existing experience by ID and username
const updateExperience = async (req, res) => {
  try {
      const { id } = req.params;
      const { position, companyName, companyLogoUrl, relatedPDFUrl, location, time, learnings, skills } = req.body;

      // Find the experience by ID and username to ensure ownership
      const experience = await recentExperience.findOne({ _id: id, username: req.devs.username });

      if (!experience) {
          return res.status(404).json({ message: 'Experience not found' });
      }

      // Update only the fields that are provided in the request body
      if (position) experience.position = position;
      if (companyName) experience.companyName = companyName;
      if (location) experience.location = location;
      
      if (time) experience.time = time;

      if (req.files && req.files.companyLogoUrl) {
        experience.companyLogoUrl = req.files.companyLogoUrl[0].path;
    }
  
    if (req.files && req.files.relatedPDFUrl) {
      experience.relatedPDFUrl = req.files.relatedPDFUrl[0].path;
    }
      

      // Update learnings if provided
      if (learnings && Array.isArray(learnings)) {
          experience.learnings = learnings.map(learning => ({ name: learning.name }));
      }

      // Update skills if provided
      if (skills && Array.isArray(skills)) {
          experience.skills = skills.map(skill => ({ name: skill.name }));
      }

      const updatedExperience = await experience.save();
      res.status(200).json(updatedExperience);
  } catch (error) {
      res.status(500).json({ message: 'Error updating experience', error: error.message });
  }
};


// DELETE an experience by ID and username
const deleteExperience = async (req, res) => {
  try {
    const deletedExperience = await recentExperience.findOneAndDelete({
      _id: req.params.id, 
      username: req.devs.username  // Ensure only the user who created it can delete it
    });
    if (!deletedExperience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD a new learning to an experience (only by the owner)
const addLearning = async (req, res) => {
  try {
    const experience = await recentExperience.findOne({ _id: req.params.id, username: req.devs.username });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.learnings.push(req.body);  // Add new learning
    await experience.save();
    res.status(200).json(experience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ADD a new skill to an experience (only by the owner)
const addSkill = async (req, res) => {
  try {
    const experience = await recentExperience.findOne({ _id: req.params.id, username: req.devs.username });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.skills.push(req.body);  
    await experience.save();
    res.status(200).json(experience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// REMOVE a learning from an experience (only by the owner)
const removeLearning = async (req, res) => {
  try {
    const experience = await recentExperience.findOne({ _id: req.params.id, username: req.devs.username });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.learnings = experience.learnings.filter(
      learning => learning._id.toString() !== req.params.learningId
    );
    await experience.save();
    res.status(200).json(experience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// REMOVE a skill from an experience (only by the owner)
const removeSkill = async (req, res) => {
  try {
    const experience = await recentExperience.findOne({ _id: req.params.id, username: req.devs.username });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    experience.skills = experience.skills.filter(
      skill => skill._id.toString() !== req.params.skillId
    );
    await experience.save();
    res.status(200).json(experience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllExperiencesPublic = async (req, res) => {
  try {
    const { username } = req.params;
    // console.log("Fetching experiences for username:", username);

    // Use the 'username' field instead of '_id' to query the database
    const experiences = await recentExperience.find({ username: username }).select('-_id -username -__v -createdAt -updatedAt');

    res.status(200).json(experiences);
  } catch (err) {
    console.error("Error fetching experiences:", err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getAllExperiencesPublic,
  createExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  addLearning,
  addSkill,
  removeLearning,
  removeSkill
};
