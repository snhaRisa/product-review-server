
const mongoose = require('mongoose'); 
const MONGO_URI = encodeURI(process.env.MONGO_URI); 

const configureDB = async ()=>
{   
    try
    {
        const connect = await mongoose.connect(MONGO_URI);
        console.log('Successfully connected to Database!');
    }
    catch(err)
    {
        console.error('Error connecting with the database !', err);
    }
}

module.exports = configureDB; 

