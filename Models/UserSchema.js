const mongoose = require('mongoose')

const pastRidesSchema = new mongoose.Schema({
    ticket_id: {
        type: String
    },
    personCount: {
        type: Number
    },
    booking_date: {
        type: String 
    },
    trip_type: {
        type: String
    },
    from_location: {
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
    to_location: {
        type: String
    },
    drop_off: {
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
    return_drop_off: {
        type: String
    },
    total_amount: {
        type: Number
    },
    payment_ref_id: {
        type: String
    },
    notes: {
        type: String
    }
});

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        dob: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        user_type: {
            type: String,
            required: true
        },
        firebase_uid: {
            type: String,
        },
        past_rides: [pastRidesSchema]
    },
    {timestamps: true},
);

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;