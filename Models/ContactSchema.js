const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
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
    service: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    business_name: {
        type: String
    }
});

const ContactModel = mongoose.model('messages', ContactSchema);
module.exports = ContactModel;