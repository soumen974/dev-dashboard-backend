const mongoose=require('mongoose');

const projectSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    title: { type: String },
    thumbNailImage:{type:String},
    github_link: { type: String },
    website_link: { type: String },
    description: { type: String },
    learning:[{name:{type:String}}],
    skills: [{ name: { type: String } }]

})

const project=mongoose.model('projects',projectSchema);

module.exports=project;