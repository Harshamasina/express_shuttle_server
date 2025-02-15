const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();
const UserModel = require('../Models/UserSchema');

router.get('/', (req , res) => {
    res.send(`Hello from Express Shuttle Services`)
});

//Posting users info
router.post('/api/users', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user_email = await UserModel.findOne({ email });

        if(user_email){
            return res.status(422).json({
                error: "User already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({
            ...req.body,
            password: hashedPassword,
        });
        const savedUser = await user.save();
        res.status(201).json({
            message: "User saved successfully",
            data: savedUser,
        });
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add user information",
        });
    }
});

//Fetching all Users Info
router.get('/api/fetch_all_users', async (req, res) => {
    try{
        const users_data = await UserModel.find({}, 'name email phone dob user_type firebase_uid').sort({ createdAt: -1 });
        res.status(201).json(users_data);
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to fetch user information",
        });
    }
});

//Searching for User
router.get('/api/search_user/:search', async(req, res) => {
    try{
        const search = req.params.search;
        const userData = await UserModel.find({
            $or: [
                { email: { $regex: new RegExp(search, 'i') } },
                { phone: { $regex: new RegExp(search, 'i') } },
                {firebase_uid: { $regex: new RegExp(search, 'i') } }
            ]
        });
        if(userData.length === 0){
            res.status(422).json({
                error: "Can't find user information",
            });
        } else {
            res.status(200).json(userData);
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user information",
        });
    }
});

//Fetching Single User Info using Mail
router.get('/api/fetch_user/:user_email', async (req, res) => {
    try{
        const user_email = req.params.user_email;
        const user_data = await UserModel.findOne({email: user_email});
        if(!user_data){
            res.status(422).json({
                error: "User Not Found, Please Check your Mail"
            });
        } else {
            res.status(201).json(user_data);
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user information",
        });
    }
});

// Fetch all Firebase UID's
router.get('/api/fetch_uids', async (req, res) => {
    try{
        const uidData = await UserModel.find({}, { firebase_uid: 1, _id: 0 });
        const uidArray = uidData.map(user => user.firebase_uid);
        res.status(201).json(uidArray);
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user id information",
        });
    }
});

//Fetch User by Firebase Id
router.get('/api/fetch_fb_id/:user_id', async (req, res) => {
    try{
        const user_id = req.params.user_id;
        const user_data = await UserModel.findOne({firebase_uid: user_id});
        if(!user_data){
            res.status(422).json({
                error: "User Not Found, Please Check your Mail"
            });
        } else {
            res.status(201).json(user_data);
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user information",
        });
    }
});

//Fetching Single User Info using document Id
router.get('/api/fetch_user_by_id/:user_id', async (req, res) => {
    try{
        const user_id = req.params.user_id;
        const user_data = await UserModel.findById(user_id);
        if(!user_data){
            res.status(422).json({
                error: "User Not Found, Please Check user ID"
            });
        } else {
            res.status(201).json(user_data);
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user information",
        });
    }
});

// Updating User

module.exports = router;
