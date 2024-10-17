const mongoose=require('mongoose');

const licennceCertificationSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    certificatePdf: { type: String },
    company_name: { type: String },
    company_name_logo: { type: String },
    Certification_title: { type: String },
    time: { type: String },
    skills: [
      { name: { type: String } }
    ]

})

const licenceCertifications=mongoose.model('licenceCertifications',licennceCertificationSchema);

module.exports=licenceCertifications;