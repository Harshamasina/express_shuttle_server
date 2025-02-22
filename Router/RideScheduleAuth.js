const express = require('express');
const router = express.Router();
require('dotenv').config();
const RouteScheduleModel = require('../Models/RouteSchema');
 
router.post('/api/route_schedule', async (req, res) => {
    try{
        const scheduleData = {...req.body};
        const newSchedule = new RouteScheduleModel(scheduleData);

        await newSchedule.save();
        res.status(201).json({
            message: "New Schedule saved successfully",
            data: newSchedule,
        });
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add message information",
        });
    }
});

router.get('/api/fetch_all_routes', async (req, res) => {
    try {
        const scheduleData = await RouteScheduleModel.find({});
        if(scheduleData.length === 0){
            res.status(422).json({
                error: "Ride Schedules Not Found, Please try again"
            });
        } else {
            res.status(201).json(scheduleData);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message || err,
            message: 'Failed to fetch Rides Schedules.'
        });
    }
});

router.get('/api/route_details', async (req, res) => {
    try {
        // Trim extra whitespace and newline characters
        const trip_type = req.query.trip_type?.trim();
        const to_location = req.query.to_location?.trim();
        const from_location = req.query.from_location?.trim();

        // Find the ride for the given to_location and from_location
        const ride = await RouteScheduleModel.findOne({ to_location, from_location });

        if (!ride) {
            return res.status(404).json({ message: "No ride found for given locations" });
        }

        const response = {
            pick_up_times: ride.pick_up_info.map((p) => p.pick_up_time),
            pick_up: ride.pick_up,
            drop_off: ride.drop_off
        };

        if (trip_type === "return") {

            const returnRide = await RouteScheduleModel.findOne({ 
                to_location: from_location, 
                from_location: to_location 
            });

            if (returnRide) {
                response.return_pick_up_times = returnRide.pick_up_info.map((p) => p.pick_up_time);
                response.return_pick_up = returnRide.pick_up;
                response.return_drop_off = returnRide.drop_off;
            } else {
                response.return_trip_message = "No return ride found";
            }
        }
        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching route details:", err);
        res.status(500).json({ message: "Failed to fetch route information", error: err.message });
    }
});

module.exports = router;