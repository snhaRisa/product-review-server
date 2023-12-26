
const jwt = require('jsonwebtoken'); 
const userModel = require('../models/user-model');

const authorization = async (req, res, next)=>
{
    let token = req.headers['authorization']; 

    if(token)
    {
        token = token.split(' ')[1];

        const tokenData = jwt.verify(token, process.env.SECRET_KEY); 
        const id = tokenData._id; 
        try
        {
            const checkAdmin = await userModel.findById(id); 

            if(checkAdmin && checkAdmin.role === 'admin')
            {
                req.user = checkAdmin; 
                return next(); 
            }
            else
            {
                return res.status(400).json('Access Denied !'); 
            }
        }
        catch(err)
        {
            console.log('a')
            return res.status(400).json('Access Denied !'); 
        }
    }
    else
    {
        return res.status(403).json('Access Denied !'); 
    };
};

module.exports = authorization; 
