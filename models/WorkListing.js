const mongoose = require('mongoose');

const WorkListingSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    posting_date_and_time: { 
        type: Date, 
        default: Date.now 
    },
    task_name: { 
        type: String, 
        required: true 
    },
    task_description: { 
        type: String, 
        required: true 
    },
    completion_time: { 
        type: Date, 
        required: true 
    },
    completed: { 
        type: Boolean, 
        default: false 
    }
});

const WorkListing = mongoose.model('WorkListing', WorkListingSchema);
module.exports = WorkListing;
