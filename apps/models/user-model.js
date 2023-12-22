
const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const userModelSchema = new Schema({
    username:{
        type: String,  
        required: true, 
        unique: true
    },
    email:{
        type: String, 
        required: true, 
        unique: true 
    }, 
    password:{
        type: String, 
        required: true
    }, 
    image:{
        type: String, 
        default: ""
    }, 
    role: {
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user', 
        required: true
    }
}, {timestamps: true});

const userModel = mongoose.model('userModel', userModelSchema);

module.exports = userModel; 
