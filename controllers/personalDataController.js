const PersonalData = require('../models/personalData');

const createOrUpdatePersonalData = async (req, res) => {
    try {
        const { name, email, phone, headline, description, about } = req.body;
        const username = req.devs.username;

        const updateFields = {
            name,
            email,
            phone,
            headline,
            description,
            about
        };

        // Check for uploaded files and add them to updateFields if present
        if (req.files && req.files.imageUrl) {
            updateFields.imageUrl = req.files.imageUrl[0].path;
        }

        if (req.files && req.files.resumeUrl) {
            updateFields.resumeUrl = req.files.resumeUrl[0].path;
        }

        const personalData = await PersonalData.findOneAndUpdate(
            { username },
            updateFields,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: 'Personal data created/updated successfully', data: personalData });
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

const getPersonalDataForOutside = async (req, res) => {
    try {
        const { username } = req.params;
        // Find personal data by username
        const personalData = await PersonalData.findOne({ username }).select('-_id -username -__v -createdAt -updatedAt');
        if (!personalData) {
            return res.status(404).json({ message: 'Personal data not found for this user' });
        }

        res.status(200).json( personalData );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



module.exports = {
    createOrUpdatePersonalData,
    getPersonalData,
    deletePersonalData,
    getPersonalDataForOutside
};
