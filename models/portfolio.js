// models/portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
   username: { 
        type: String, 
        required: true 
    },

  personal_data: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    github_link: { type: String },
    linkedIn_link: { type: String },
    degree: { type: String },
    university_name: { type: String },
    roll_no: { type: String },

    headline: { type: String },
    description: { type: String },
    about: { type: String },
  },
  education: [{institute:{type:String},degree:{type:String},time:{type:String},marks:{type:String}}],
  recent_experience: {
    position: { type: String },
    company: { type: String },
    time: { type: String },
    learning:[{name:{type:String}}],
    mode: { type: String }

  },
  projects: [
    {
      title: { type: String },
      github_link: { type: String },
      website_link: { type: String },
      description: { type: String },
      learning:[{name:{type:String}}],
      skills: [{ name: { type: String } }],
    }
  ],
  services: [
    {
      title: { type: String },
      description: { type: String },
    }
  ],
  licenses_and_certifications: [
    {
      image: { type: String },
      company: { type: String },
      logo: { type: String },
      title: { type: String },
      time: { type: String },
      skills: [
        { name: { type: String } }
      ],
    }
  ],
  socials: [{
        github: { type: String },
        linkedin: { type: String },
        x: { type: String },
        insta: { type: String },
        upwork: { type: String }
    }],
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
