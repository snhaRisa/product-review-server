//CommonJS modulo loaders. 
require('dotenv').config();
const port = (process.env.PORT) || 4008;

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 

const {checkSchema} = require('express-validator');

const configureDB = require('./configuration/configureDB');
const authentication = require('./apps/middlewares/authentication');
const authorization = require('./apps/middlewares/authorization');
const userController = require('./apps/controllers/user-controller');
const { userRegisterValidationSchema, userLoginValidationSchema }= require('./apps/helpers/user-validation');


const app = express(); 

//Middlewares. 
app.use(express.json()); 
app.use(cors()); 

//Configuration of Atlas.
configureDB(); 


//authentication level APIs. 
app.post('/register', checkSchema(userRegisterValidationSchema), userController.register); 
app.post('/login', checkSchema(userLoginValidationSchema), userController.login);

//Private routes for user.
// app.get('/account-details', authentication, userController.getAccount); 


//Running the server. 
app.listen(port, ()=>
{
    console.log('Server is up and running on port number', port); 
});

