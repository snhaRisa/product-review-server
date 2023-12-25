
const ProductModel = require('../models/product-model');

const titleSchema = {
    notEmpty:{
        errorMessage: 'Title cannot be Blank !'
    }, 
    custom:{
        options: async (value, {req})=>
        {
            if(req.url === '/add-product')
            {
                const productCheck = await ProductModel.findOne({title: value});
                if(productCheck)
                {
                    throw new Error('A similar product already exists.')
                }
                else
                {
                    return true
                }
            }
        }
    }
};

const descriptionSchema = {
    notEmpty:{
        errorMessage: 'Description cannot be empty !'
    }, 
    isLength:{
        options: {min:5}, 
        errorMessage: 'Minimum length of 5 characters.'
    }
};

const categorySchema = {
    notEmpty:{
        errorMessage: 'Category cannot be empty!'
    }
};

const productValidationSchema = {
    title: titleSchema, 
    description: descriptionSchema, 
    category: categorySchema
};

module.exports = productValidationSchema; 
