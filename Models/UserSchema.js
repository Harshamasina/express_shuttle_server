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
            type: String
        },
        last_name: {
            type: String
        },
        phone: {
            type: Number
        },
        email: {
            type: String
        },
        address: {
            type: String
        },
        dob: {
            type: Date
        },
        user_type: {
            type: String
        },
        past_rides: [pastRidesSchema]
    },
    {timestamps: true},
);

const UserModel = mongoose.model('', UserSchema);
module.exports = UserModel;