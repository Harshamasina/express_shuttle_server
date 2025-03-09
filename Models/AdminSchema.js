const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob:{
        type: String,
        required: true
    },
    employee_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    designation: {
        type: String
    },
    address: {
        type: String
    },
    firebase_uid: {
        type: String
    }
});

const AdminModel = mongoose.model('admins', AdminSchema);
module.exports = AdminModel;