const mongoose = require('mongoose');

const PickUpTimeSchema = new mongoose.Schema({
    pick_up_time: {
        type: String,
        required: true
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
