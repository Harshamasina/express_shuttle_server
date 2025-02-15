const mongoose = require('mongoose');

const PickUpDateInfoSchema = new mongoose.Schema({
    pick_up_date: {
        type: Date,
        required: true
    },
    total_seats: {
        type: Number,
        required: true
    },
    seats_remaining: {
        type: Number,
        default: 0
    },
    ticket_ids: {
        type: [String],
        default: []
    }
});

const PickUpTimeSchema = new mongoose.Schema({
    pick_up_time: {
        type: String,
        required: true
    },
    date_info: {
        type: [PickUpDateInfoSchema],
        default: []
    }
});

const RouteScheduleSchema = new mongoose.Schema({
    ride: {
        type: String,
        required: true
    },
    to_location: {
        type: String,
        required: true
    },
    from_location: {
        type: String,
        required: true
    },
    ride_cost: {
        type: Number,
        required: true
    },
    pick_up: {
        type: [String],
        required: true
    },
    pick_up_info: {
        type: [PickUpTimeSchema],
        default: []
    },
    drop_off: {
        type: [String],
        required: true
    },
}, { timestamps: true });

const RouteScheduleModel = mongoose.model('routes', RouteScheduleSchema);
module.exports = RouteScheduleModel;
