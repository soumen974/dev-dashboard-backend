const bcrypt = require('bcrypt');
const devs = require('../models/devs'); // Assuming you're using Mongoose and the devs.js model

const getAlldevs = async (req, res) => {
  try {
    const devs = await devs.find();
    res.status(200).json(devs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const dev = await devs.findById(req.devs.id);
    if (!dev) {
      return res.status(404).send(`Could not find user with id ${req.devs.id}`);
    }
    res.status(200).json(dev);
  } catch (err) {
    res.status(500).send(`Error retrieving user: ${err.toString()}`);
  }
};

const updateUserById = async (req, res) => {
  const id = req.devs.id;
  const devs = req.body;

  const updates = {};
  if (devs.username) updates.username = devs.username;
  if (devs.name) updates.name = devs.name;
  if (devs.email) updates.email = devs.email;
  if (devs.password) updates.password = await bcrypt.hash(devs.password, 10);
  if (devs.security_question) updates.security_question = devs.security_question;
  if (devs.security_answer) updates.security_answer = devs.security_answer;

  if (Object.keys(updates).length === 0) {
    return res.status(400).send('No valid fields to update');
  }

  try {
    const updatedDev = await devs.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedDev) {
      return res.status(404).send(`Could not find user with id ${id}`);
    }
    res.status(200).send('User updated successfully');
  } catch (err) {
    res.status(500).send(`Error updating user: ${err.message}`);
  }
};

module.exports = {
  getAlldevs,
  getUserById,
  updateUserById
};
