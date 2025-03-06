const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const AdminModel = require("../Models/AdminSchema");

router.post('/api/admins', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin_email = await AdminModel.findOne({ email });

        if(admin_email){
            return res.status(422).json({
                error: "admin already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new AdminModel({
            ...req.body,
            password: hashedPassword,
        });
        const savedAdmin = await admin.save();
        res.status(201).json({
            message: "Admin saved successfully",
            data: savedAdmin,
        });
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add admin information",
        });
    }
});

//Fetching Single User Info using document Id
router.get('/api/fetch_admin_uid/:admin_uid', async (req, res) => {
    try{
        const admin_uid = req.params.admin_uid;
        const admin_data = await AdminModel.findOne({firebase_uid: admin_uid});
        if(!admin_data){
            res.status(422).json({
                error: "User Not Found, Please Check user ID"
            });
        } else {
            res.status(201).json(admin_data);
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch admin information",
        });
    }
});

// Fetch all Firebase UID's
router.get('/api/fetch_admins_no', async (req, res) => {
    try{
        const phoneData = await AdminModel.find({}, { phone: 1, _id: 0 });
        const phoneArray = phoneData.map(admin => admin.phone);
        res.status(201).json(phoneArray);
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch user id information",
        });
    }
});

module.exports = router;