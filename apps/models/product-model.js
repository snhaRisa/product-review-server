
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
            productId: {
                type: Schema.Types.ObjectId, 
                ref: 'ProductModel'
            },
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
            }, 
            likes: [
                {
                    userId:{
                        type: Schema.Types.ObjectId, 
                        ref: 'userModel'
                    }
                }
            ], 
            dislikes: [
                {
                    userId:{
                        type: Schema.Types.ObjectId, 
                        ref: 'userModel'
                    }
                }
            ]
        }
    ] 
});

const ProductModel = mongoose.model('ProductModel', productSchema);

module.exports = ProductModel; 
