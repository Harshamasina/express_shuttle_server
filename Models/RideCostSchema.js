const mongoose = require('mongoose');

const CostSchema = new mongoose.Schema({
    from_location: {
        type: String
    },
    to_location: {
        type: String
    },
    oneway_cost: {
        type: Number
    },
    return_cost:{
        type: Number
    }
});

const RideCostModel = mongoose.model('costs', CostSchema);
module.exports = RideCostModel;