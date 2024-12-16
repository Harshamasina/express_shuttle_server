const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    location_name: {
        type: String,
        required: true
    },
    location_code: {
        type: String,
        required: true
    },
    location_link: {
        type: String,
        required: true
    },
    location_address: {
        type: String,
        required: true
    },
    location_active: {
        type: Boolean
    }
});

const RidesModel = mongoose.model('locations', LocationSchema);
module.exports = RidesModel;