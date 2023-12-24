//CommonJS modulo loaders. 
require('dotenv').config();
const port = (process.env.PORT) || 4008;

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const fileUpload = require('express-fileupload');

const {checkSchema} = require('express-validator');

const configureDB = require('./configuration/configureDB');
const authentication = require('./apps/middlewares/authentication');
const authorization = require('./apps/middlewares/authorization');
const userController = require('./apps/controllers/user-controller');
const productController = require('./apps/controllers/product-controller');
const { userRegisterValidationSchema, userLoginValidationSchema } = require('./apps/helpers/user-validation');
const productValidationSchema = require('./apps/helpers/product-validation');


const app = express(); 

//Middlewares. 
app.use(express.json()); 
app.use(cors()); 
app.use(fileUpload({
    useTempFiles: true //this is used to handle the path of our image.
}));

//Configuration of Atlas.
configureDB(); 

//authentication level APIs. 
app.post('/register', checkSchema(userRegisterValidationSchema), userController.register); 
app.post('/login', checkSchema(userLoginValidationSchema), userController.login);

//Private routes for user.
app.get('/get-account', authentication, userController.getAccount); 
app.post('/upload-image', authentication, userController.uploadUserImage);

//Admin routes
//Product related APIs. 
app.post('/add-product', authorization, checkSchema(productValidationSchema), productController.addProduct);
app.put('/update-product', authorization, checkSchema(productValidationSchema), productController.updateProduct); 
app.delete('/delete-product', authorization, productController.deleteProduct);

//Running the server. 
app.listen(port, ()=>
{
    console.log('Server is up and running on port number', port); 
});

