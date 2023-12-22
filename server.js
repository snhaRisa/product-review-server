//CommonJS modulo loaders. 
require('dotenv').config();

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 

const port = (process.env.PORT) || 4008; 
const configureDB = require('./configuration/configureDB');

const app = express(); 

//Middlewares. 
app.use(express.json()); 
app.use(cors()); 

configureDB(); 

app.listen(port, ()=>
{
    console.log('Server is up and running on port number', port); 
});

