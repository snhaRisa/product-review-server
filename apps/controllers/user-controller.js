
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const userModel = require('../models/user-model');

const userController = {}; 

userController.register = async (request, response)=>
{
    const body = request.body; 
    const errors = validationResult(request); 

    if(!errors.isEmpty())
    {
        return response.status(400).json({errors: errors.array()});
    }

    try
    {
        const {username, email, password} = request.body; 
        
        const salt = await bcryptjs.genSalt();
        const hashPassword = await bcryptjs.hash(password, salt);
        
        if(email === 'rishav99@gmail.com')
        {
            const newUserDoc = await userModel.create({username, email, password: hashPassword, role: 'admin'}); 
            response.json('Successfully made you the Admin !');
        }
        else
        {
            const newUserDoc = await userModel.create({username, email, password: hashPassword});
            response.json('Successfully created the user !');    
        }        
    }
    catch(err)
    {
        response.status(400).json(err);
    }
};

userController.login = async (request, response)=>
{
    const body = request.body; 
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
                const token = jwt.sign(tokenData, process.env.SECRET_KEY); 
                response.json(`Bearer ${token}`); 
            }
            else
            {
                response.status(400).json('Incorrect E-Mail or Password !');
            }
        }
        else
        {
            response.status(400).json('Incorrect E-Mail or Password !');
        }
    }
    catch(err)
    {
        response.status(400).json(err);
    };
};

module.exports = userController; 
