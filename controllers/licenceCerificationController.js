const licenceCertifications=require('../models/licensesCertifications');

const createLicenceCertification = async (req, res) => {
    try{
        const newLicenceCertification=new licenceCertifications({
            ...req.body,
            username:req.devs.username
        });

        if(req.files && req.files.certificatePdfUrl){
            newLicenceCertification.certificatePdfUrl=req.files.certificatePdfUrl[0].path;
        }
        if(req.files && req.files.company_name_logoUrl){
            newLicenceCertification.company_name_logoUrl=req.files.company_name_logoUrl[0].path;
        }
        await newLicenceCertification.save();
        res.status(201).json(newLicenceCertification);
    }catch(err){
        res.status(400).json({message:err.message});
    }
};
 
const getLicenceCertifications = async (req, res) => {
    try{
        const LicenceCertifications = await licenceCertifications.find({username:req.devs.username});
        res.status(200).json(LicenceCertifications);

    }catch(error){
        res.status(500).json({ message: error.message});
    }
};


const updateLicenceCertifications = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, certification_title, time, skills } = req.body;
        
        const LicenceCertifications = await licenceCertifications.findOne({ _id: id, username: req.devs.username });
        
        if (!LicenceCertifications) return res.status(404).json({ message: 'No licenses and certification found' });
        
        if (company_name) LicenceCertifications.company_name = company_name;
        if (certification_title) LicenceCertifications.certification_title = certification_title;
        if (time) LicenceCertifications.time = time;

        if (skills && Array.isArray(skills)) {
            LicenceCertifications.skills = skills.map(skill => ({ name: skill.name }));
        }

        if (req.files && req.files.company_name_logoUrl) {
            LicenceCertifications.company_name_logoUrl = req.files.company_name_logoUrl[0].path;
        }

        if (req.files && req.files.certificatePdfUrl) {
            LicenceCertifications.certificatePdfUrl = req.files.certificatePdfUrl[0].path;
        }

        const updatedLicenceCertifications = await LicenceCertifications.save();
        res.status(200).json(updatedLicenceCertifications);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLicenceCertifications = async (req, res) => {
    try{
        const LicenceCertifications = await licenceCertifications.findOneAndDelete({
            _id: req.params.id,
            username:req.devs.username
        });

        if(!LicenceCertifications) return res.status(404).json({ message: 'not found '});

        res.status(200).json({ message: 'Deleted Successfully' });

    }catch(error){
        res.status(500).json({ message: error.message});

    }
};

const addSkills = async (req, res) => {
    try {
      const LicenceCertifications = await licenceCertifications.findOne({ _id: req.params.id, username: req.devs.username });
      if (!LicenceCertifications) {
        return res.status(404).json({ message: 'Licence and Certifications not found' });
      }
  
      LicenceCertifications.skills.push(req.body); 
      await LicenceCertifications.save();
      res.status(200).json(LicenceCertifications);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
};

const deleteSkills = async (req, res) => {
    try {
        const LicenceCertifications = await licenceCertifications.findOne({ _id: req.params.id, username: req.devs.username });
        
        if (!LicenceCertifications) {
            return res.status(404).json({ message: 'Licence and Certifications not found' });
        }

        LicenceCertifications.skills = LicenceCertifications.skills.filter(skill => skill._id.toString() !== req.params.skillId);

        await LicenceCertifications.save();
        
        res.status(200).json(LicenceCertifications);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getLicenceCertificationsPublic = async (req, res) => {
    try{
        const { username } = req.params;
        const LicenceCertifications = await licenceCertifications.find({username:username}).select('-_id -username -__v -createdAt -updatedAt');
        res.status(200).json(LicenceCertifications);

    }catch(error){
        res.status(500).json({ message: error.message});
    }
};



module.exports = {
    getLicenceCertificationsPublic,
    createLicenceCertification,
    getLicenceCertifications,
    updateLicenceCertifications,
    deleteLicenceCertifications,
    addSkills,
    deleteSkills

}