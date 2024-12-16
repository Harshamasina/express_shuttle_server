const mongoose = require('mongoose');

const pastRidesSchema = new mongoose.Schema({
    payment: {
        type: Number
    },
    payment_confirm: {
        type: String
    },
    payment_ref_id: {
        type: String
    },
    booking_date: {
        type: String
    },
    pick_up: {
        type: String
    },
    pick_up_date: {
        type: String
    },
    pick_up_time: {
        type: String
    },
    return_pick_up: {
        type: String
    },
    return_pick_up_date: {
        type: String
    },
    return_pick_up_time: {
        type: String
    },
    flight_no: {
        type: String
    },
    booking_date: {
        type: String
    },
    user_id: {
        type: String
    },
    user_name: {
        type: String
    },
    user_email: {
        type: String
    },
    user_phone: {
        type: String
    },
});

const RidesModel = mongoose.model('', pastRidesSchema);
module.exports = RidesModel;