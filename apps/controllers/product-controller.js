
const cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');

const ProductModel = require('../models/product-model');

//configuring cloudinary.
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY_CLOUD, 
    api_secret: process.env.API_SECRET_CLOUD 
});

const productController = {}; 

productController.addProduct = async (req, res)=>
{
    res.header("Access-Control-Allow-Origin", "*");
    const errors = validationResult(req);
    const {title, description, category} = req.body;
    const file = req.files.productImage; 

    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    };
    if(!file || Object.keys(file).length === 0)
    {
        return res.status(400).json('No File Selected!'); 
    };
    if(!file.mimetype.startsWith('image/'))
    {
        return res.status(400).json('File uploaded is not an image!'); 
    };

    try
    {
        const uploading = await cloudinary.uploader.upload(file.tempFilePath); 
        if(uploading.url)
        {
            //Same title was added thrice. Check this. 
            const productDoc = await ProductModel.create({
                title, 
                description, 
                category, 
                image: uploading.url
            });
            res.json(productDoc);
        }
        else
        {
            res.status(400).json('Could not save the product.');
        };
    }
    catch(err)
    {
        res.status(400).json(err);
    }
};

productController.updateProduct = async (req, res)=>
{
    res.header("Access-Control-Allow-Origin", "*");
    const errors = validationResult(req); 
    const file = req.files.productImage; 

    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    };
    if(!file || Object.keys(file).length===0)
    {
        return res.status(400).json('No File Uploaded.')
    };
    if(!file.mimetype.startsWith('image/'))
    {
        return res.status(400).json('Uploaded file is not an Image.');
    };

    try
    {
        const {productId, title, description, category} = req.body;
        const upload = await cloudinary.uploader.upload(file.tempFilePath);
        if(upload.url)
        {
            const updateDoc = await ProductModel.findByIdAndUpdate(productId, {title, description, category, image:upload.url}, {runValidators:true, new: true}); 
            res.json(updateDoc); 
        }
        else
        {
            console.log('wh')
            res.status(400).json('Error updating the product details.');
        };
    }
    catch(err)
    {
        res.status(400).json('Error updating the product.');
        console.error(err);
    }
};

productController.deleteProduct = async (req, res)=>
{
    try
    {
        const {productId} = req.body; 

        const productDoc = await ProductModel.findByIdAndDelete(productId); 
        const remainingDocs = await ProductModel.find(); 
        res.json(remainingDocs); 
    }
    catch(err)
    {
        res.status(400).json('Error deleting the product.');
    }
};

module.exports = productController;
