const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const userSchema = require('../Router/userSchema.js');

router.get('/', (req , res) => {
    res.send(`Hello from Express Shuttle Services`)
});

//Posting users info
router.post('/api/users', async (req, res) => {
    try {
        const user = new userSchema(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to add user information",
        });
    }
});

//Fetching all Users Info

//Fetching Single User Info



//Creating Drop Off and Pick Up Location

//Deleting Drop Off and Pick Up Location

//Updating Drop off and Pick Up Location

module.exports = router;