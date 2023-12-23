
const jwt = require('jsonwebtoken'); 
const userModel = require('../models/user-model');

const authorization = async (request, response, next)=>
{
    let token = request.headers['authorization']; 
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
                request.user(checkAdmin); 
                next();
            }
            else
            {
                response.status(400).json('Access Denied !'); 
            }
        }
        catch(err)
        {
            response.status(400).status('Access Denied !'); 
        }
    }
    else
    {
        response.status(403).json('Access Denied !'); 
    };
};

module.exports = authorization; 
