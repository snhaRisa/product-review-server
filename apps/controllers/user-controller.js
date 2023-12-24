
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');

const userModel = require('../models/user-model');
// const configureCloudinary = require('../../configuration/configureCloudinary');

const userController = {}; 

//configuring cloudinary.
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY_CLOUD, 
    api_secret: process.env.API_SECRET_CLOUD 
});

userController.register = async (req, res)=>
{
    const body = req.body; 
    const errors = validationResult(req); 

    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    try
    {
        const {username, email, password} = req.body; 
        
        const salt = await bcryptjs.genSalt();
        const hashPassword = await bcryptjs.hash(password, salt);
        
        if(email === 'rishav99@gmail.com')
        {
            const newUserDoc = await userModel.create({username, email, password: hashPassword, role: 'admin'}); 
            res.json('Successfully made you the Admin !');
        }
        else
        {
            const newUserDoc = await userModel.create({username, email, password: hashPassword});
            res.json('Successfully created the user !');    
        }        
    }
    catch(err)
    {
        res.status(400).json(err);
    }
};

userController.login = async (req, res)=>
{
    const body = req.body; 
    try
    {
        const {email, password} = body; 

        const checkUser = await userModel.findOne({email:email});

        if(checkUser)
        {
            const compare = await bcryptjs.compare(password, checkUser.password);
            if(compare)
            {
                const tokenData = {
                    _id : checkUser._id
                }; 
                const expiresIn = '1h';
                const token = jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn}); 
                res.json(`Bearer ${token}`); 
            }
            else
            {
                res.status(400).json('Incorrect E-Mail or Password !');
            }
        }
        else
        {
            res.status(400).json('Incorrect E-Mail or Password !');
        }
    }
    catch(err)
    {
        res.status(400).json(err);
    };
};

userController.getAccount = async (req, res)=>
{
    try
    {
        const {user} = req; 
        const userId = user._id; 

        const userDoc = await userModel.findOne({_id: userId});
        if(userDoc)
        {
            const tempObj = {
                _id: userDoc._id,
                username: userDoc.username,
                email: userDoc.email,
                image: userDoc.image,
                createdAt: userDoc.createdAt,
                updatedAt: userDoc.updatedAt, 
                role: userDoc.role
            }
            res.json(tempObj);
        }
        else
        {
            res.status(400).json({});
        };
    }
    catch(err)
    {
        res.status(400).json('Access Denied !');
    }
};

userController.uploadUserImage = async (req, res)=>
{
    //Was not able to use cors. Need to implement & learn correct architecture.
    res.header("Access-Control-Allow-Origin", "*");
 
    const file = req.files.userImage;
    const tokenData = req.user; 
    const userId = tokenData._id; 

    if(!file || Object.keys(file).length === 0)
    {
        return res.status(400).json('No file selected !')
    };
    if(!file.mimetype.startsWith('image/'))
    {
        return res.status(400).json('Received file is not an Image !');
    };

    try
    {   
        const uploading = await cloudinary.uploader.upload(file.tempFilePath);
        if(uploading.url)
        {
            const userDoc = await userModel.findByIdAndUpdate(userId, {image: uploading.url}, {new:true, runValidators: true}); 
            const tempObj = {
                _id: userDoc._id, 
                username: userDoc.username, 
                email: userDoc.email, 
                createdAt: userDoc.createdAt, 
                image: userDoc.image
            }
            res.json(tempObj);
        }
        else
        {
            res.status(400).json('Error uploading image!');
        }
    }
    catch(err)
    {
        res.status(400).json('Error uploading image!');
    }
}

module.exports = userController; 
