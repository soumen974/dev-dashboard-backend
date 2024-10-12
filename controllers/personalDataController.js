const PersonalData = require('../models/personalData');

// Create personal data for a user
const createPersonalData = async (req, res) => {
    try {
        const { name, email, phone, headline, description, about } = req.body;
        const username = req.devs.username;

        // Check if personal data already exists for the user
        const existingData = await PersonalData.findOne({ username });
        if (existingData) {
            return res.status(400).json({ message: 'Personal data already exists for this user' });
        }

        // Check if both image and PDF are uploaded
        if (!req.files || (!req.files.imageUrl && !req.files.resumeUrl)) {
            return res.status(400).json({ message: 'Image and/or PDF not uploaded' });
        }

        // Create new personal data
        const newPersonalData = new PersonalData({
            username,
            name,
            imageUrl: req.files.imageUrl ? req.files.imageUrl[0].path : "",   
            email,
            phone,
            headline,
            description,
            about,
            resumeUrl: req.files.resumeUrl ? req.files.resumeUrl[0].path : ""
        });

        // Save the new personal data
        await newPersonalData.save();
        res.status(201).json({ message: 'Personal data created successfully', data: newPersonalData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


const getPersonalData = async (req, res) => {
    try {
        const username=req.devs.username;


        // Find personal data by username
        const personalData = await PersonalData.findOne({ username });
        if (!personalData) {
            return res.status(404).json({ message: 'Personal data not found for this user' });
        }

        res.status(200).json({ message: 'Personal data retrieved successfully', data: personalData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update personal data for a user
const updatePersonalData = async (req, res) => {
    try {
        const username = req.devs.username;
        const { name, email, phone, headline, description, about } = req.body;

        // Check if files are uploaded (image and/or PDF)
        if (!req.files || (!req.files.imageUrl && !req.files.resumeUrl)) {
            return res.status(400).json({ message: 'Image and/or PDF not uploaded' });
        }

        // Find and update personal data by username
        const updatedPersonalData = await PersonalData.findOneAndUpdate(
            { username },
            {
                name,
                imageUrl: req.files.imageUrl ? req.files.imageUrl[0].path : "",
                email,
                phone,
                headline,
                description,
                about,
                resumeUrl: req.files.resumeUrl ? req.files.resumeUrl[0].path : ""
            },
            { new: true, runValidators: true }
        );

        if (!updatedPersonalData) {
            return res.status(404).json({ message: 'Personal data not found for this user' });
        }

        res.status(200).json({ message: 'Personal data updated successfully', data: updatedPersonalData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


const deletePersonalData = async (req, res) => {
    try {
        const username  = req.devs.username;

        // Find and delete personal data by username
        const deletedPersonalData = await PersonalData.findOneAndDelete({ username });
        if (!deletedPersonalData) {
            return res.status(404).json({ message: 'Personal data not found for this user' });
        }

        res.status(200).json({ message: 'Personal data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



module.exports = {
    createPersonalData,
    getPersonalData,
    updatePersonalData,
    deletePersonalData
};
