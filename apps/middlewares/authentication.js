
const jwt = require('jsonwebtoken'); 

const authentication = (req, res, next)=>
{
    let token = req.headers['authentication']; 

    if(token)
    {
        token = token.split(' ')[1];
        const tokenData = jwt.verify(token, process.env.SECRET_KEY);
        req.user = tokenData; 
        next(); 
    }
    else
    {
        res.status(403).json('Access Denied !');
    };
};

module.exports = authentication; 
