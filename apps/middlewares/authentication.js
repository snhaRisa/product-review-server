
const jwt = require('jsonwebtoken'); 

const authentication = (request, response, next)=>
{
    let token = request.headers['authentication']; 
    if(token)
    {
        token = token.split(' ')[1];
        const tokenData = jwt.verify(token, process.env.SECRET_KEY);
        request.user = tokenData; 
        next(); 
    }
    else
    {
        response.status(403).json('Access Denied !');
    };
};

module.exports = authentication; 
