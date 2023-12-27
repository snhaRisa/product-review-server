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

//Public routes for user. 
app.get('/get-all-products', productController.getProduct); 

//Private routes for user.
app.get('/get-account', authentication, userController.getAccount); 
app.post('/upload-image', authentication, userController.uploadUserImage);
app.get('/get-all-reviews', authentication, productController.getAllReviews);

//Product routes.
app.get('/get-one-product/:productId', authentication, productController.getOneProduct);
app.post('/add-review', authentication, productController.addReview);
app.put('/add-product-like', authentication, productController.addProductLike);
app.put('/add-review-like', authentication, productController.addReviewLike);
app.put('/add-review-dislike', authentication, productController.addReviewDislike);
app.put('/edit-review', authentication, productController.editReview);
app.delete('/delete-review', authentication, productController.deleteReview);
app.delete('/delete-review-user', authentication, productController.deleteReviewUser);

//Admin routes
//Product related APIs. 
app.get('/get-product', authorization, productController.getProduct);
app.post('/add-product', authorization, checkSchema(productValidationSchema), productController.addProduct);
app.put('/update-product', authorization, checkSchema(productValidationSchema), productController.updateProduct); 
app.delete('/delete-product', authorization, productController.deleteProduct);
app.get('/get-all-reviews-admin', authorization, productController.getAllReviewsAdmin);
//User related APIs.
app.get('/get-accounts', authorization, userController.getAccounts);
app.delete('/delete-account', authorization, userController.deleteAccount); 

//Running the server. 
app.listen(port, ()=>
{
    console.log('Server is up and running on port number', port); 
});

