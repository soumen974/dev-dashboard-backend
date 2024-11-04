const EducationData = require('../models/educationData'); // Assuming the model is in ../models/

// CREATE a new education data entry for a user
const createEducationData = async (req, res) => {
    try {
      const { institute_name, degree, roll_no, time, marks, isCurrent } = req.body;
  
      const username=req.devs.username;
  
      // Ensure that required fields are provided
      if (!institute_name || !degree) {
        return res.status(400).json({ message: 'Institute name and degree are required' });
      }
  
      // Create a new education data entry
      const newEducationData = new EducationData({
        username,
        institute_name,
        degree,
        roll_no,
        time,
        marks,
        isCurrent,
      });
  
      // Save the education data entry
      await newEducationData.save();
      res.status(201).json({ message: 'Education data added successfully', data: newEducationData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

// GET all education data for a specific user by username
const getEducationDataByUsername = async (req, res) => {
    try {
        const username=req.devs.username;
  
      const educationData = await EducationData.find({ username });
      if (!educationData || educationData.length === 0) {
        return res.status(404).json({ message: 'No education data found for this user' });
      }
  
      res.status(200).json({ message: 'Education data retrieved successfully', data: educationData });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  const updateEducationData = async (req, res) => {
    try {
        const { id } = req.params; // Education data ID
        const username = req.devs.username; // Username from request body
        const { institute_name, degree, roll_no, time, marks, isCurrent } = req.body;


        // Find the education data by ID and username
        const educationData = await EducationData.findOne({ _id: id, username });

        if (!educationData) {
            return res.status(404).json({ message: 'Education data not found for the specified user' });
        }

        // Update fields only if new values are provided
        educationData.institute_name = institute_name || educationData.institute_name;
        educationData.degree = degree || educationData.degree;
        educationData.roll_no = roll_no || educationData.roll_no;
        educationData.time = time || educationData.time;
        educationData.marks = marks || educationData.marks;
        educationData.isCurrent = typeof isCurrent === 'boolean' ? isCurrent : educationData.isCurrent;

        const updatedEducationData = await educationData.save();

        res.status(200).json({ message: 'Education data updated successfully', data: updatedEducationData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

  

  const deleteEducationData = async (req, res) => {
    try {
        const { id } = req.params; 
        const username = req.devs.username; 
      
  
      // Find and delete the education data by ID and username
      const deletedEducationData = await EducationData.findOneAndDelete({
        _id: id,
        username,
      });
  
      if (!deletedEducationData) {
        return res.status(404).json({ message: 'Education data not found for the specified user' });
      }
  
      res.status(200).json({ message: 'Education data deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

module.exports = {
  createEducationData,
  getEducationDataByUsername,
  updateEducationData,
  deleteEducationData,
};
