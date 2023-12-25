
const mongoose = require('mongoose'); 

const {Schema} = mongoose; 

const productSchema = new Schema({
    title:{
        type: String, 
        required: true
    }, 
    description:{
        type: String, 
        required: true
    }, 
    image:{
        type: String, 
        required: true,
        default: "" //only for testing purpose then delete this. 
    },
    category: {
        type: String, 
        required: true
    }, 
    likes:[
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'userModel'
            }
        }
    ],
    dislikes:[
        {
            userId:{
                type: Schema.Types.ObjectId, 
                ref: 'userModel'
            }
        }
    ],
    reviews: [
        {
            userId:{
                type: Schema.Types.ObjectId, 
                ref: 'userModel'
            }, 
            rating:{
                type: Number, 
                required: true
            },
            text:{
                type: String, 
            },
            timestamp:{
                type: Date, 
                default: Date.now, 
                required: true
            }
        }
    ] 
});

const ProductModel = mongoose.model('ProductModel', productSchema);

module.exports = ProductModel; 
