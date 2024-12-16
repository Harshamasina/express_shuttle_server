const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const userSchema = require('../Router/userSchema.js');
const rideSchema = require('../Router/RideSchema.js');
const moment = require('moment');

router.get('/', (req , res) => {
    res.send(`Hello from Express Shuttle Services`)
});

// Posting users info
router.post('/api/users', async (req, res) => {
    try {
        const user = new userSchema(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to add user information",
        });
    }
});

//Posting Rides
router.post('/api/rides', async (req, res) => {
    const { amount, currency, source, user_id, ...rideDetails } = req.body;

    try {
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,
            payment_method: source,
            confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
            const new_ride = new RidesModel({
                ...rideDetails,
                payment: amount,
                payment_confirm: 1,
                payment_ref_id: paymentIntent.id,
                booking_date: moment().format('YYYY-MM-DD'),
                acc_id: user._id,
                acc_email: user.email,
                acc_phone: user.phone,
            });
            const savedRide = await new_ride.save();

            const pastRide = {
                ticket_id: rideDetails.ticket_id,
                personCount: rideDetails.traveler_count,
                trip_start_date: rideDetails.pick_up_date,
                trip_return_date: rideDetails.return_pick_up_date,
                pick_up: rideDetails.pick_up,
                drop_off: rideDetails.drop_off,
                return_pick_up: rideDetails.return_pick_up,
                return_drop_off: rideDetails.return_drop_off,
                payment: amount,
                booking_date: moment().format('YYYY-MM-DD'),
            };

            user.past_rides.push(pastRide);
            await user.save();

            res.status(201).json({
                message: "Ride created successfully",
                ride: savedRide,
            });
        } else {
            res.status(400).json({
                message: "Payment failed",
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message,
            message: "Failed to process payment or save ride",
        });
    }
});

module.exports = router;
