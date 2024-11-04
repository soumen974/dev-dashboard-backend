const Devs = require('../models/devs');
const WorkListing = require('../models/WorkListing');

// Create a new WorkListing
const createWorkListing = async (req, res) => {
  try {
    const { task_name, task_description, completion_time } = req.body;
    const username = req.devs.username;

    if (!task_name || !task_description || !completion_time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the user by username
    const user = await Devs.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new WorkListing
    const newWorkListing = new WorkListing({
      username,
      task_name,
      task_description,
      completion_time,
    });

    // Save the WorkListing
    await newWorkListing.save();

    res.status(201).json({ message: 'Work listing created successfully', workListing: newWorkListing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getAllWorkListings = async (req, res) => {
  try {
    const username = req.devs.username;

    // Find all work listings for the user
    const workListings = await WorkListing.find({ username });

    res.status(200).json({ workListings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getWorkListingById = async (req, res) => {
    try {
      const { id } = req.params;
      const username = req.devs.username;
  
      const workListing = await WorkListing.findOne({ _id: id, username });
  
      if (!workListing) {
        return res.status(404).json({ message: 'Work listing not found' });
      }
  
      res.status(200).json({ workListing });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const updateWorkListing = async (req, res) => {
    try {
      const { id } = req.params;
      const { task_name, task_description, completion_time, completed } = req.body;
      const username = req.devs.username;
  
      const workListing = await WorkListing.findOne({ _id: id, username });
      if (!workListing) {
        return res.status(404).json({ message: 'Work listing not found or not owned by this user' });
      }
  
      workListing.task_name = task_name || workListing.task_name;
      workListing.task_description = task_description || workListing.task_description;
      workListing.completion_time = completion_time || workListing.completion_time;
      workListing.completed = typeof completed === 'boolean' ? completed : workListing.completed;
  
      await workListing.save();
  
      res.status(200).json({ message: 'Work listing updated successfully', workListing });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
  
// Delete a specific WorkListing
const deleteWorkListing = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.devs.username;

    // Find and delete the WorkListing
    const deletedWorkListing = await WorkListing.findOneAndDelete({ _id: id, username });

    if (!deletedWorkListing) {
      return res.status(404).json({ message: 'Work listing not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Work listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  createWorkListing,
  getAllWorkListings,
  getWorkListingById,
  updateWorkListing,
  deleteWorkListing
};
