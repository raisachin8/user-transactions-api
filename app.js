const express = require('express');
const mongoose = require('mongoose');

const redis = require('redis');


const app = express();
const port = 3000;
const { cacheMiddleware } = require("./middleware/cacheMiddleware.js");
const transactionRoutes = require('./routers/transactionRoutes.js');



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactions-test');

// Define User and Transaction schemas
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.use('/transactions', transactionRoutes);


// Create a new user
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



