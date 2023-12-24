
const jwt = require('jsonwebtoken'); 
const userModel = require('../models/user-model');

const authorization = async (req, res, next)=>
{
    let token = req.headers['authorization']; 
    token = token.split(' ')[1]; 

    if(token)
    {
        const tokenData = jwt.verify(token, process.env.SECRET_KEY); 
        const id = tokenData._id; 

        try
        {
            const checkAdmin = await userModel.findById(id); 
            if(checkAdmin && checkAdmin.role === 'admin')
            {
                req.user(checkAdmin); 
                next();
            }
            else
            {
                res.status(400).json('Access Denied !'); 
            }
        }
        catch(err)
        {
            res.status(400).status('Access Denied !'); 
        }
    }
    else
    {
        res.status(403).json('Access Denied !'); 
    };
};

module.exports = authorization; 
