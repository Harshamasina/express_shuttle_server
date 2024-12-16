const mongoose = require('mongoose')

const pastRidesSchema = new mongoose.Schema({
    ticket_id: {
        type: String
    },
    personCount: {
        type: Number
    },
    trip_start_date: {
        type: String
    },
    trip_return_date: {
        type: String
    },
    pick_up: {
        type: String
    },
    drop_off: {
        type: String
    },
    return_pick_up: {
        type: String
    },
    return_drop_off: {
        type: String
    },
    payment: {
        type: Number
    },
    booking_date: {
        type: String 
    }
});

const UserSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        dob: {
            type: Date,
            required: true
        },
        user_type: {
            type: String,
            required: true
        },
        past_rides: [pastRidesSchema]
    },
    {timestamps: true},
);

const UserModel = mongoose.model('', UserSchema);
module.exports = UserModel;