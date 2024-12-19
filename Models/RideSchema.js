const mongoose = require('mongoose');

const RidesSchema = new mongoose.Schema({
    ticket_id: {
        type: String,
        required: true
    },
    payment: {
        type: Number,
        required: true
    },
    payment_confirm: {
        type: Number,
        required: true
    },
    payment_ref_id: {
        type: String,
        required: true
    },
    booking_date: {
        type: String,
        required: true
    },
    pick_up: {
        type: String,
        required: true
    },
    pick_up_date: {
        type: String,
        required: true
    },
    pick_up_time: {
        type: String,
        required: true
    },
    drop_off: {
        type: String,
        required: true
    },
    drop_off_date: {
        type: String,
        required: true
    },
    drop_off_time: {
        type: String,
        required: true
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
    return_drop_off: {
        type: String
    },
    return_drop_off_date: {
        type: String
    },
    return_drop_off_time: {
        type: String
    },
    flight_no: {
        type: String
    },
    acc_id: {
        type: String,
        required: true
    },
    traveler_count: {
        type: Number,
        required: true
    },
    acc_phone: {
        type: String,
        required: true
    },
    acc_email: {
        type: String,
        required: true
    }
},
{timestamps: true});

const RidesModel = mongoose.model('rides', RidesSchema);
module.exports = RidesModel;