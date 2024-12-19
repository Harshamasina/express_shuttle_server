const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    location_name: {
        type: String,
        required: true
    },
    location_code: {
        type: String,
        required: true,
        unique: true,
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
        type: String
    },
    location_town: {
        type: String
    }
});

const LocationModel = mongoose.model('locations', LocationSchema);
module.exports = LocationModel;