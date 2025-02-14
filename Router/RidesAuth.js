const express = require('express');
const router = express.Router(); 
require('dotenv').config();
const moment = require('moment');
const RidesModel = require('../Models/RideSchema.js');
const UserModel = require('../Models/UserSchema.js');


const generateTicketId = async () => {
    let ticketId;
    let isUnique = false;

    while (!isUnique) {
        ticketId = `ES${Math.floor(100000 + Math.random() * 900000)}`;
        const existingRide = await RidesModel.findOne({ ticket_id: ticketId });
        if (!existingRide) {
            isUnique = true;
        }
    }
    return ticketId;
};

// Posting Rides
router.post('/api/rides', async (req, res) => {
    try {
        const { acc_id, payment_result } = req.body;

        // Validate user existence
        const user_data = await UserModel.findOne({ firebase_uid: acc_id });
        if (!user_data) {
            return res.status(422).json({
                error: "User Not Found, Please Check your Mail",
            });
        }

        const acc_phone = user_data.phone;
        const booking_date = moment().format('YYYY-MM-DD');
        const ticket_id = await generateTicketId();

        // Create a new ride
        const newRide = new RidesModel({
            ...req.body,
            ticket_id,
            booking_date,
            acc_phone,
            payment_result: {
                payment_id: payment_result.payment_id,
                payment_status: payment_result.payment_status,
                paid_at: payment_result.paid_at,
                payment_email: payment_result.payment_email,
            },
        });

        // Add ride details to user's past rides
        const pastRideDetails = {
            ticket_id,
            personCount: req.body.traveler_count,
            booking_date,
            trip_type: req.body.trip_type,
            from_location: req.body.from_location,
            pick_up: req.body.pick_up,
            pick_up_date: req.body.pick_up_date,
            pick_up_time: req.body.pick_up_time,
            to_location: req.body.to_location,
            drop_off: req.body.drop_off,
            return_pick_up: req.body.return_pick_up,
            return_pick_up_date: req.body.return_pick_up_date,
            return_pick_up_time: req.body.return_pick_up_time,
            return_drop_off: req.body.return_drop_off,
            total_amount: req.body.total_amount,
            payment_ref_id: payment_result.payment_id,
            notes: req.body.notes,
        };
        user_data.past_rides.push(pastRideDetails);

        await newRide.save();
        await user_data.save();

        res.status(201).json({
            success: true,
            message: "Ride details posted successfully and stored in past rides in users",
            data: newRide,
        });
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to add Rides information",
        });
    }
});

//Fetching Rides Data
router.get('/api/search_rides/:search', async (req, res) => {
    try {
        const search = req.params.search;

        const rideData = await RidesModel.find({
            $or: [
                { ticket_id: { $regex: new RegExp(search, 'i') } },
                { acc_phone: { $regex: new RegExp(search, 'i') } },
                { acc_email: { $regex: new RegExp(search, 'i') } },
                { acc_id: { $regex: new RegExp(search, 'i') } },
                { 'payment_result.payment_id': search }
            ]
        });

        if(rideData.length === 0) {
            return res.status(404).json({
                error: `No rides found matching term: ${search}`,
            });
        }
        
        res.status(200).json(rideData);
    } catch (err) {
        console.log('Search error:', err);
        res.status(500).json({
            error: err.message,
            message: "Failed to fetch Rides information",
        });
    }
});

module.exports = router;