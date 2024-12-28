const mongoose = require('mongoose');

const RidesScheduleSchema = new mongoose.Schema({
    ride:{
        type: String
    },
    to_location: {
        type: String,
    },
    from_location: {
        type: String,
    },
    ride_cost: {
        type: Number,
    },
    pick_up: {
        type: Array,
    },
    pick_up_times: {
        type: Array,
    },
    drop_off: {
        type: Array
    },
    return_cost: {
        type: Number,
    },
    return_pick_up: {
        type: Array
    },
    return_pick_time: {
        type:Array
    },
    return_drop_off: {
        type:Array
    }
});

const RidesScheduleModel = mongoose.model('schedules', RidesScheduleSchema);
module.exports = RidesScheduleModel;