const bcrypt = require('bcrypt');
const Dev = require('../models/devs'); // Assuming your model is named 'devs'

// Get all developers
const getAllDevs = async (req, res) => {
  try {
    const devs = await Dev.find({});
    res.status(200).json(devs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a developer by ID
const getUserById = async (req, res) => {
  try {
    const dev = await Dev.findById(req.devs.id);
    if (!dev) {
      return res.status(404).send(`Could not find user with id ${req.devs.id}`);
    }
    res.status(200).json(dev);
  } catch (err) {
    res.status(500).send(`Error retrieving user: ${err.message}`);
  }
};

// Update a developer by ID
const updateUserById = async (req, res) => {
  const id = req.devs.id;
  const { username, name, email, password, security_question, security_answer } = req.body;

  try {
    const updates = {};

    if (username) updates.username = username;
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }
    if (security_question) updates.security_question = security_question;
    if (security_answer) updates.security_answer = security_answer;

    if (Object.keys(updates).length === 0) {
      return res.status(400).send('No valid fields to update');
    }

    const updatedDev = await Dev.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedDev) {
      return res.status(404).send(`Could not find user with id ${id}`);
    }

    res.status(200).send('User updated successfully');
  } catch (err) {
    res.status(500).send(`Error updating user: ${err.message}`);
  }
};

module.exports = {
  getAllDevs,
  getUserById,
  updateUserById
};
