const mongoose = require('mongoose');

const personal_dataSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        },
        name: { type: String },
        imageUrl: { type: String },
        email: { type: String },
        phone: { type: String },    
        headline: { type: String },
        description: { type: String },
        about: { type: String },
}, { timestamps: true });

const personal_data = mongoose.model('personal_data', personal_dataSchema);
module.exports = personal_data;
