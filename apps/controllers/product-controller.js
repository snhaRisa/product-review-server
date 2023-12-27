
const _ = require('lodash');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const ProductModel = require('../models/product-model');

//configuring cloudinary.
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY_CLOUD, 
    api_secret: process.env.API_SECRET_CLOUD 
});

const productController = {}; 

const sendNotificationEmail = async (recipientEmail) =>
{
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth:{
            user: process.env.EMAIL, 
            pass:process.env.EMAIL_PASSWORD
        }
    });
  
    const mailOptions = {
        from: process.env.EMAIL,
        to: recipientEmail,
        subject: 'New Review Added!',
        text: `A new review has been added! See What's New.`,
    };
  
    try 
    {
        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent to ${recipientEmail}`);
    } 
    catch (err)
    {
        console.error(`Error sending notification email to ${recipientEmail}:`, err);
    }
};

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
};

productController.getAllReviews = async (req, res)=>
{
    try
    {
        const { _id } = req.user; 
        const products = await ProductModel.find().populate('reviews.productId'); 

        const reviews = []; 
        for(const obj of products)
        {
            for(const review of obj.reviews)
            {
                if(review.userId.equals(_id))
                {
                    reviews.push(review);
                }
            }
        };

        res.json(reviews);
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json('Error retrieving all products.');
    }
};

productController.getAllReviewsAdmin = async (req, res)=>
{
    try
    {
        const products = await ProductModel.find().populate('reviews.productId').populate('reviews.userId'); 

        const reviews = []; 
        for(const obj of products)
        {
            for(const review of obj.reviews)
            {
                reviews.push(review);
            }
        };

        res.json(reviews); 
    }
    catch(err)
    {
        res.status(400).json('Error fetching all documents.');
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

        const allDocs = await ProductModel.find().populate('reviews.userId').populate('likes.userId');

        const mails = []; 

        for(const obj of allDocs)
        {
            for(const ele of obj.likes)
            {
                mails.push(ele.userId.email);
            }
        };
        for(const obj of allDocs)
        {
            for(const ele of obj.reviews)
            {
                mails.push(ele.userId.email);
            }
        };

        const mailsToSend = _.uniq(mails);
        mailsToSend.forEach((email) => 
        {
            sendNotificationEmail(email);
        });

        res.json(updateDoc);
    }
    catch(err)
    {
        console.error(err);
        res.status(400).json('Error Adding Review.');
    }
};

productController.editReview = async (req, res)=>
{
    try
    {
        const { _id } = req.user; 
        const {reviewId, productId, updateData} = req.body; 

        const updatedReview = await ProductModel.findOneAndUpdate(
            {
              _id: productId,
              'reviews._id': reviewId,
              'reviews.userId': _id,
            },
            {
              $set: {
                'reviews.$': updateData,
              },
            },
            { new: true }
        );

        const doc = await ProductModel.findById(productId);
        res.json(doc);
    }
    catch(err)
    {
        res.status(400).json('Error updating your review.');
    }
}

productController.deleteReview = async (req, res)=>
{
    try
    {
        const {reviewId, productId, userId} = req.body; 

        const result = await ProductModel.updateOne(
            { _id: productId, 'reviews._id': reviewId, 'reviews.userId': userId },
            { $pull: { reviews: { _id: reviewId } } }
        );

        const products = await ProductModel.find().populate('reviews.productId').populate('reviews.userId'); 

        const reviews = []; 
        for(const obj of products)
        {
            for(const review of obj.reviews)
            {
                reviews.push(review);
            }
        };

        res.json(reviews);
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json('Error deleting the product.');
    }
};

productController.deleteReviewUser = async (req, res)=>
{
    try
    {
        const {productId, reviewId, userId} = req.body; 

        const tempDoc = await ProductModel.findOneAndUpdate(
            {_id: productId, 'reviews._id': reviewId, 'reviews.userId': userId},
            {$pull: {reviews: {_id: reviewId}}}, 
            {new: true}
        );

        const productDoc = await ProductModel.findById(productId).populate('reviews.productId');
        res.json(productDoc);
    }
    catch(err)
    {
        res.status(400).json('Error deleting the review');
    }
}

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

productController.addReviewLike = async (req, res)=>
{
    try
    {
        const {productId, reviewId, userId} = req.body; 
        const updatedProduct = await ProductModel.findOneAndUpdate(
            { 'reviews._id': reviewId, _id: productId },
            {
              $push: {
                'reviews.$.likes': { userId: userId },
              },
              $pull: {
                'reviews.$.dislikes': { userId: userId },
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
            {
              $push: { 'reviews.$.dislikes': { userId: userId } },
              $pull: { 'reviews.$.likes': { userId: userId } },
            },
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
