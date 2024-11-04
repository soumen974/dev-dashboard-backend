const mongoose=require('mongoose');

const educationDataSchema=new mongoose.Schema({
    username:{
        type: String, 
        required: true
    },
    institute_name:{type:String},
    degree:{type:String},
    roll_no:{type:String,spare:true},
    time:{type:String},
    marks:{type:String},
    isCurrent:{type:Boolean}

},{timestamps:true});

const educationData=mongoose.model('education_Data',educationDataSchema);

 module.exports=educationData;