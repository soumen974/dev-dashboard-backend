const mongoose=require('mongoose');

const SocialsSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    github: { type: String },
    linkedin: { type: String },
    x: { type: String },
    insta: { type: String },
    upwork: { type: String }

})

const Socials=mongoose.model('Socials',SocialsSchema);

module.exports=Socials;