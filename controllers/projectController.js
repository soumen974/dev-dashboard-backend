const Project = require('../models/projects');

// Create a new project
const createProject = async (req, res) => {
  try {
    const newProject = new Project({
      ...req.body,
      username: req.devs.username 
    });

    if (req.files && req.files.thumbNailImage) {
      newProject.thumbNailImage = req.files.thumbNailImage[0].path;
    }

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getProjectsByUsername = async (req, res) => {
  try {
    const projects = await Project.find({ username: req.devs.username });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update a project by ID
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const{ title ,github_link , website_link ,description,learning,skills,thumbNailImage}=req.body;
    const project = await Project.findOne({ _id: id, username: req.devs.username });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update fields only if new values are provided
    if(title) project.title = title;
    if(github_link) project.github_link =  github_link;
    if(website_link)project.website_link = website_link;
    if(description)project.description = description;

    // Update learning and skills arrays only if provided
    if (learning && Array.isArray(learning)) {
      project.learning = learning.map(learning => ({ name: learning.name }));
    }

    if (skills && Array.isArray(skills)) {
        project.skills = skills.map(skill => ({ name: skill.name }));
    }

    // Handle file update for thumbnail image
    if (req.files && req.files.thumbNailImage) {
      project.thumbNailImage = req.files.thumbNailImage[0].path;
    }

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a project by ID
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
        _id: req.params.id, 
        username: req.devs.username 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addLearning = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, username: req.devs.username });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.learning.push(req.body); 
    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addSkills = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, username: req.devs.username });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.skills.push(req.body); 
    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteLearning = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, username: req.devs.username });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.learning = project.learning.filter(
        learning => learning._id.toString() !== req.params.learningId);
    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteSkill = async (req,res)=>{
    try{
        const project = await Project.findOne({_id:req.params.id,username:req.devs.username});
        if (!project) {
            return res.status(404).json({ message: 'Experience not found' });
          }

          project.skills = project.skills.filter(
            skill => skill._id.toString() !== req.params.skillId
          );
          await project.save();
          res.status(200).json(project);

    }catch(err){
        res.status(400).json({message:err.message});

    }
}

const getProjectsByUsernamePublic = async (req, res) => {
  try {
    const { username } = req.params;
    const projects = await Project.find({ username: username }).select('-_id -username -__v -createdAt -updatedAt');
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




module.exports = {
  getProjectsByUsernamePublic,
  createProject,
  getProjectsByUsername,
  updateProject,
  deleteProject,
  addLearning,
  addSkills,
  deleteLearning,
  deleteSkill

};
