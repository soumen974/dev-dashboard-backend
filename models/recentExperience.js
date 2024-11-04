const mongoose =require('mongoose');

const recentExperienceSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    position: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLogoUrl: { type: String },  
    relatedPDFUrl: { type: String },   
    location: { type: String},
    time: { type: String },  
    learnings: [{ name: { type: String, required: true } }],
    skills: [{ name: { type: String, required: true } }]

});

const recentExperience = mongoose.model('recent_experiences',recentExperienceSchema);

module.exports= recentExperience;