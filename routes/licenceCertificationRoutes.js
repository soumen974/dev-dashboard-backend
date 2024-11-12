const express = require('express');
const {
    getLicenceCertificationsPublic,
    createLicenceCertification,
    getLicenceCertifications,
    updateLicenceCertifications,
    deleteLicenceCertifications,
    addSkills,
    deleteSkills
} = require('../controllers/licenceCerificationController');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { storage } = require('../services/cloudinary');
const upload = multer({ storage });

const router = express.Router();

router.post('/licence-certification' , authenticateToken, upload.fields([{ name: 'certificatePdfUrl' }, { name: 'company_name_logoUrl' }]), createLicenceCertification);

router.get('/licence-certification' ,authenticateToken,getLicenceCertifications );

router.put('/licence-certification/:id', authenticateToken,upload.fields([{ name: 'certificatePdfUrl' }, { name: 'company_name_logoUrl' }]), updateLicenceCertifications);

router.delete('/licence-certification/:id', authenticateToken, deleteLicenceCertifications);

router.post('/licence-certification/:id/skill', authenticateToken, addSkills);

router.delete('/licence-certification/:id/skill/:skillId', authenticateToken, deleteSkills);
router.get('/licence-certification/:username',getLicenceCertificationsPublic );


module.exports=router;