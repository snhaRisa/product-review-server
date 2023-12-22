
const userModel = require('../models/user-model');

const userNameSchema = {
    notEmpty:{
        errorMessage: "Username cannot be empty !"
    }, 
    custom:{
        options: async (value, {req})=>
        {
            if(req.url==='/register')
            {
                const user = await userModel.findOne({username: value}); 
                if(user)
                {
                    throw new Error('Username already registered!')
                }
                else
                {
                    return true
                }
            }
        }
    }
};

const emailRegisterSchema = {
    notEmpty:{
        errorMessage: "E-Mail cannot be empty !"
    }, 
    isEmail:{
        errorMessage: "Invalid E-Mail format !"
    },
    custom:{
        options: async (value, {req})=>
        {
            if(req.url==='/register')
            {
                const user = await userModel.findOne({email: value}); 
                if(user)
                {
                    throw new Error('E-Mail already registered !')
                }
                else
                {
                    return true
                }
            }
        }
    }
};

const emailLoginSchema = {
    notEmpty:{
        errorMessage : "E-Mail cannot be blank !"
    }, 
    isEmail:{
        errorMessage : "Invalid Format !"
    }
};

const passwordSchema = {
    notEmpty:{
        errorMessage: "Password cannot be empty !"
    }, 
    isLength:{
        options: {min: 8, max:128},
        errorMessage: "Password length should be between 8 to 128 characters !"
    }
}

const userRegisterValidationSchema = {
    username: userNameSchema, 
    email: emailRegisterSchema, 
    password: passwordSchema
};

const userLoginValidationSchema = {
    email : emailLoginSchema, 
    password : passwordSchema
};

module.exports = {
    userRegisterValidationSchema, 
    userLoginValidationSchema
};

