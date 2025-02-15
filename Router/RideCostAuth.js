const express = require('express');
const RideCostModel = require('../Models/RideCostSchema');
const router = express.Router();
require('dotenv').config();

router.post('/api/ride_cost', async (req, res) => {
    try{
        const ride_cost_data = {...req.body};
        const newRideData = new RideCostModel(ride_cost_data);

        await newRideData.save();
        res.status(201).json({
            message: "New Ride Cost saved successfully",
            data: newRideData,
        });
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add Ride Cost information",
        });
    }
});

router.get('/api/fetch_costs', async (req, res) => {
    try{
        const trip_type = req.query.trip_type?.trim();
        const to_location = req.query.to_location?.trim();
        const from_location = req.query.from_location?.trim();

        if (!trip_type || !to_location || !from_location) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        const rideCost = await RideCostModel.findOne({ to_location, from_location });

        if (!rideCost) {
            return res.status(404).json({ message: "No ride cost found for the given locations" });
        }

        if (trip_type === "oneway") {
            return res.status(200).json({ cost: rideCost.oneway_cost });
        } 
        
        if (trip_type === "return") {
            return res.status(200).json({ cost: rideCost.return_cost });
        } 
        
        return res.status(400).json({ message: "Invalid trip type. Use 'oneway' or 'return'." });

    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch Ride Cost information",
        });
    }
});

module.exports = router;