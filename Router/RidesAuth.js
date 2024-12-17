const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const rideSchema = require('../Models/RideSchema.js');
const moment = require('moment');
// const stripe = Stripe('your_stripe_secret_key');

// Posting Rides
// router.post('/api/rides', async (req, res) => {
//     const { amount, currency, source, user_id, ...rideDetails } = req.body;

//     try {
//         const user = await userSchema.findById(user_id);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount * 100,
//             currency: currency,
//             payment_method: source,
//             confirm: true,
//         });

//         if (paymentIntent.status === 'succeeded') {
//             const new_ride = new rideSchema({
//                 ...rideDetails,
//                 payment: amount,
//                 payment_confirm: 1,
//                 payment_ref_id: paymentIntent.id,
//                 booking_date: moment().format('YYYY-MM-DD'),
//                 acc_id: user._id,
//                 acc_email: user.email,
//                 acc_phone: user.phone,
//             });
//             const savedRide = await new_ride.save();

//             const pastRide = {
//                 ticket_id: rideDetails.ticket_id,
//                 personCount: rideDetails.traveler_count,
//                 trip_start_date: rideDetails.pick_up_date,
//                 trip_return_date: rideDetails.return_pick_up_date,
//                 pick_up: rideDetails.pick_up,
//                 drop_off: rideDetails.drop_off,
//                 return_pick_up: rideDetails.return_pick_up,
//                 return_drop_off: rideDetails.return_drop_off,
//                 payment: amount,
//                 booking_date: moment().format('YYYY-MM-DD'),
//             };

//             user.past_rides.push(pastRide);
//             await user.save();

//             res.status(201).json({
//                 message: "Ride created successfully",
//                 ride: savedRide,
//             });
//         } else {
//             res.status(400).json({
//                 message: "Payment failed",
//             });
//         }
//     } catch (err) {
//         res.status(500).json({
//             error: err.message,
//             message: "Failed to process payment or save ride",
//         });
//     }
// });

//Fetching Rides Data

// Updating Rides Data

module.exports = router;