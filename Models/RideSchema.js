const mongoose = require('mongoose');

const RidesSchema = new mongoose.Schema({
    ticket_id: {
        type: String,
    },
    base_amount: {
        type: Number,
    },
    total_amount: {
        type: Number,
    },
    payment_confirm: {
        type: Number,
    },
    payment_ref_id: {
        type: String,
    },
    booking_date: {
        type: String,
    },
    trip_type: {
        type: String,
    },
    from_location: {
        type: String,
    },
    pick_up: {
        type: String,
    },
    pick_up_date: {
        type: String,
    },
    pick_up_time: {
        type: String,
    },
    to_location: {
        type: String,
    },
    drop_off: {
        type: String,
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
    airline: {
        type: String
    },
    acc_id: {
        type: String,
    },
    traveler_count: {
        type: Number,
    },
    acc_phone: {
        type: String,
    },
    acc_email: {
        type: String,
    },
    notes: {
        type: String,
    }
},
{timestamps: true});

const RidesModel = mongoose.model('rides', RidesSchema);
module.exports = RidesModel;