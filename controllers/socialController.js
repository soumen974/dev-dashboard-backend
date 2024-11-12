const Socials=require('../models/socials');

const createOrUpdateSocials = async (req, res) => {
    try {
        const username = req.devs.username;
        const { github, linkedin, x, insta, upwork } = req.body;

        const socialsData =await Socials.findOneAndUpdate(
            { username },
            {
                username,
                github,
                linkedin,
                x,
                insta,
                upwork
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Social information successfully created or updated',
            socials: socialsData
        });
    }catch(error){
        res.status(500).json({ message: 'Server error', error });
    }
};

const getSocialsInfo = async (req, res) => {

    try {
        const username = req.devs.username;
        const socialsData =await Socials.findOne({ username});

        if(!socialsData){
            return res.status(404).json({ message: 'Social information not found' });
        }

        res.status(200).json({ socials: socialsData });
    }catch(error){
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteSocialsInfo = async (req, res) => {
    try {
        const username = req.devs.username;
        const result = await Socials.findOneAndDelete({ username });

        if(!result){
            return res.status(404).json({ message: 'Social information not found' });
        }
        res.status(200).json({ message: 'Social information deleted successfully' });

    }catch(error){
        res.status(500).json({ message: 'Server error', error });
    }
}

const getSocialsInfoPublic = async (req, res) => {

    try {
        const { username } = req.params;
        const socialsData =await Socials.findOne({ username}).select('-_id -username -__v -createdAt -updatedAt');

        if(!socialsData){
            return res.status(404).json({ message: 'Social information not found' });
        }

        res.status(200).json(socialsData );
    }catch(error){
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { 
    getSocialsInfoPublic,
    createOrUpdateSocials ,
    getSocialsInfo,
    deleteSocialsInfo
};