const express = require('express');
const router = express.Router();
require('dotenv').config();
const moment = require('moment');
const RidesScheduleModel = require("../Models/RideScheduleSchema");

router.post('/api/ride_schedule', async (req, res) => {
    try{
        const scheduleData = {...req.body};
        const newSchedule = new RidesScheduleModel(scheduleData);

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

router.get('/api/fetch_schedule/:ride', async (req, res) => {
    try {
        const ride = req.params.ride;
        const scheduleData = await RidesScheduleModel.findOne({ ride });

        if (!scheduleData) {
            return res.status(404).json({
                message: 'Ride schedule not found.'
            });
        }
        res.status(200).json(scheduleData);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message || err,
            message: 'Failed to fetch schedule information.'
        });
    }
});

module.exports = router;