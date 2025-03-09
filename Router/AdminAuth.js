const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const AdminModel = require("../Models/AdminSchema");

router.post('/api/admins', async (req, res) => {
    try {
        const { email, password, employee_id, phone } = req.body;
        const duplicateAdmin = await AdminModel.findOne({
            $or: [
                { email },
                { employee_id },
                { phone }
            ]
        });

        if (duplicateAdmin) {
            if (duplicateAdmin.email === email) {
                return res.status(422).json({ error: "Admin already exists" });
            }
            if (duplicateAdmin.employee_id === employee_id) {
                return res.status(422).json({ error: "Employee Id already exists" });
            }
            if (duplicateAdmin.phone === phone) {
                return res.status(422).json({ error: "Phone Number already exists" });
            }
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
        res.status(422).json({
            error: err,
            message: "Failed to fetch admin information",
        });
    }
});

//Fetch Admin Account Details
router.get('/api/fetch_admin_acc/:search', async (req, res) => {
    try{
        const search = req.params.search;

        const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapeRegex(search), 'i');

        const adminData = await AdminModel.find({
            $or: [
                { phone: { $regex: regex } },
                { email: { $regex: regex } },
                { firebase_uid: { $regex: regex } }
            ]
        });

        if(!adminData){
            res.status(422).json({
                error: "User Not Found, Please Check user ID"
            });
        } else {
            res.status(201).json(adminData);
        }
    } catch (err) {
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
        res.status(422).json({
            error: err,
            message: "Failed to fetch user id information",
        });
    }
});

module.exports = router;