
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

productController.getProduct = async (req, res)=>
{
    try
    {
        const productDocs = await ProductModel.find();
        if(productDocs.length>0)
        {
            res.json(productDocs);
        }
        else
        {
            res.json({});
        }
    }
    catch(err)
    {
        res.status(400).json('Error fetching the Products.');
    }
};

productController.getOneProduct = async (req, res)=>
{
    try
    {   
        const {productId} = req.params; 
        const productDoc = await ProductModel.findById(productId).populate('reviews.userId'); 
        if(productDoc)
        {
            res.json(productDoc)
        }
        else
        {
            res.status(400).json({});
        }
    }
    catch(err)
    {
        res.status(400).json('Could not fetch the document.');
    }
}

productController.updateProduct = async (req, res)=>
{
    res.header("Access-Control-Allow-Origin", "*");
 
    const {productId, titleTemp, categoryTemp, descriptionTemp, fileImg} = req.body;  
    let file; 
    
    try
    {
        //If new image uploaded. Uploading it and updating. 
        if(req.files && req.files.fileImg)
        {
            file = req.files.fileImg;

            if(file)
            {
                if(!file.mimetype.startsWith('image/'))
                {
                    return res.status(400).json('Uploaded file is not an image.');
                }

                const upload = await cloudinary.uploader.upload(file.tempFilePath);
                if(upload.url)
                {
                    const updateDoc = await ProductModel.findByIdAndUpdate(productId, {title: titleTemp, description: descriptionTemp, category: categoryTemp, image:upload.url}, {runValidators:true, new: true}); 
                    const remainingDocs = await ProductModel.find(); 
                    res.json(remainingDocs); 
                }
                else
                {
                    res.status(400).json('Error updating the product details.');
                };
            }
        }
        else  //If no image, uploading the url itself. 
        {
            const updateDoc = await ProductModel.findByIdAndUpdate(productId, {title: titleTemp, description: descriptionTemp, category: categoryTemp, image: fileImg}, {runValidators: true, new: true}); 
            const remainingDocs = await ProductModel.find(); 
            res.json(remainingDocs); 
        }
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
        console.error(err);
        res.status(400).json('Error deleting the product.');
    }
};

productController.addReview = async (req, res)=>
{
    try
    {
        const {productId, userId, rating, text} = req.body.tempObj; 
        
        const newReview = {
            productId: productId, 
            userId: userId, 
            rating: rating, 
            text: text, 
            timestamp: Date.now(), 
        };

        const updateDoc = await ProductModel.findByIdAndUpdate(productId, 
            {$push:{reviews: newReview}}, 
            {new: true}
        ).populate('reviews.userId');

        res.json(updateDoc);
    }
    catch(err)
    {
        res.status(400).json('Error Adding Review.');
    }
};

productController.addProductLike = async (req, res)=>
{
    try
    {
        const {productId, userId} = req.body; 

        const updateDoc = await ProductModel.findByIdAndUpdate(productId, 
            {$push: {likes: {userId: userId}}}, 
            {new: true}
        ).populate('reviews.userId'); 

        res.json(updateDoc);
    }
    catch(err)
    {
        res.status(400).json('Error while liking the product.');
    };
};

productController.addProductDislike = async (req, res)=>
{
    try
    {
        const {productId, userId} = req.body; 

        const updateDoc = await ProductModel.findByIdAndUpdate(productId, 
            {$push: {dislikes: {userId: userId}}}, 
            {new: true}
        ).populate('reviews.userId'); 

        res.json(updateDoc);
    }
    catch(err)
    {
        res.status(400).json('Error while liking the product.');
    };
};

productController.addReviewLike = async (req, res)=>
{
    try
    {
        const {productId, reviewId, userId} = req.body; 
        const updatedProduct = await ProductModel.findOneAndUpdate(
            {'reviews._id': reviewId, _id: productId},
            {
              $push: 
              {
                'reviews.$.likes': { userId: userId },
              },
            },
            { new: true }
        ).populate('reviews.userId');

        res.json(updatedProduct);
    }
    catch(err)
    {
        res.status(400).json('Error liking the review.'); 
    }
};

productController.addReviewDislike = async (req, res)=>
{
    try
    {
        const {productId, reviewId, userId} = req.body; 
        const updatedProduct = await ProductModel.findOneAndUpdate(
            { _id: productId, 'reviews._id': reviewId }, 
            { $push: { 'reviews.$.dislikes': { userId: userId } } }, 
            { new: true }
        ).populate('reviews.userId');
        
        res.json(updatedProduct);
    }
    catch(err)
    {
        res.status(400).json('Error disliking the review.'); 
    }
};

module.exports = productController;
