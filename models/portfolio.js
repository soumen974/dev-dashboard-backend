// models/portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  dev: { type: mongoose.Schema.Types.ObjectId, ref: 'Devs', required: true },
  personal_data: {
    name: { type: String },
    headline: { type: String },
    description: { type: String },
    about: { type: String },
  },
  recent_experience: {
    position: { type: String },
    company: { type: String },
    time: { type: String },
  },
  projects: [
    {
      title: { type: String },
      github_link: { type: String },
      website_link: { type: String },
      description: { type: String },
      skills: [
        { name: { type: String } }
      ],
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
  ]
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
