const mongoose=require('mongoose');

const servicesSchema = new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    title: { type: String },
    description: { type: String }

})

const service=mongoose.model('service',servicesSchema);

module.exports=service;