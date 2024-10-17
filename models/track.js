const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        },
    github: { 
        github_id: { type: String },
        token: { type: String }
    },
    codeforces: { 
        codeforces_id: { type: String },
        token: { type: String }
    },
    codechef: { 
        codechef_id: { type: String },
        token: { type: String }
    },          
    hackerrank: { 
        hackerrank_id: { type: String },
        token: { type: String }
    },
    leetcode: { 
        leetcode_id: { type: String },
        token: { type: String }
    }
}, { timestamps: true });

const Track = mongoose.model('Track', trackSchema);
module.exports = Track;
