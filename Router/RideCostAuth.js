const express = require('express');
const RideCostModel = require('../Models/RideCostSchema');
const RidesModel = require('../Models/RideSchema.js');
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
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch Ride Cost information",
        });
    }
});

router.get('/api/fetch_seats_count', async (req, res) => {
    try {
        const trip_type = req.query.trip_type?.trim();
        const to_location = req.query.to_location?.trim();
        const from_location = req.query.from_location?.trim();
        const pick_up_date = req.query.pick_up_date?.trim();
        const pick_up_time = req.query.pick_up_time?.trim();
        const return_pick_up_date = req.query.return_pick_up_date?.trim();
        const return_pick_up_time = req.query.return_pick_up_time?.trim();

        if (!trip_type || !to_location || !from_location || !pick_up_date || !pick_up_time) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        const MAX_SEATS = 11;

        // ==========  RETURN TRIP  ==========
        if (trip_type === 'return') {
            // Must have return date/time
            if (!return_pick_up_date || !return_pick_up_time) {
                return res.status(400).json({ message: "Missing required return trip query parameters" });
            }

            //------------------------------------------------------------------
            // 1) Outbound leg seats from 'from_location' -> 'to_location'
            //    on (pick_up_date / pick_up_time).
            //    We include BOTH:
            //      - "oneway" rides for that exact route/time
            //      - "return" rides for that outbound route/time
            //------------------------------------------------------------------
            const outboundBookings = await RidesModel.find({
                $or: [
                    // (A) Oneway with same route/time
                    {
                        trip_type: 'oneway',
                        from_location,
                        to_location,
                        pick_up_date,
                        pick_up_time: { $regex: new RegExp(`^${pick_up_time}$`, 'i') },
                    },
                    // (B) Return with same outbound route/time
                    {
                        trip_type: 'return',
                        from_location,
                        to_location,
                        pick_up_date,
                        pick_up_time: { $regex: new RegExp(`^${pick_up_time}$`, 'i') },
                    }
                ]
            });

            const outboundTravelerCount = outboundBookings.reduce(
                (sum, doc) => sum + (doc.traveler_count || 0),
                0
            );
            const outboundSeatsRemaining = Math.max(MAX_SEATS - outboundTravelerCount, 0);

            //------------------------------------------------------------------
            // 2) Return leg seats from 'to_location' -> 'from_location'
            //    on (return_pick_up_date / return_pick_up_time).
            //    We include BOTH:
            //      - "return" rides whose return leg is that date/time
            //      - "oneway" rides with the reversed route/time
            //------------------------------------------------------------------
            const returnBookings = await RidesModel.find({
                $or: [
                    // (A) A "return" booking whose *return* leg matches
                    {
                        trip_type: 'return',
                        return_pick_up_date,
                        return_pick_up_time: { $regex: new RegExp(`^${return_pick_up_time}$`, 'i') },
                        // The code doesn't strictly need from/to checks here,
                        // but if you want to be strict about route:
                        // from_location, to_location for the return leg's logic,
                        // you'd store them the same way in your DB.
                    },
                    // (B) A "oneway" ride that goes from to_location -> from_location
                    //     on return_pick_up_date / return_pick_up_time
                    {
                        trip_type: 'oneway',
                        from_location: to_location,
                        to_location: from_location,
                        pick_up_date: return_pick_up_date,
                        pick_up_time: { $regex: new RegExp(`^${return_pick_up_time}$`, 'i') }
                    }
                ]
            });

            const returnTravelerCount = returnBookings.reduce(
                (sum, doc) => sum + (doc.traveler_count || 0),
                0
            );
            const returnSeatsRemaining = Math.max(MAX_SEATS - returnTravelerCount, 0);

            return res.json({
                outbound_seats_remaining: outboundSeatsRemaining,
                return_seats_remaining: returnSeatsRemaining
            });

        // ==========  ONE-WAY TRIP  ==========
        } else {
            //------------------------------------------------------------------
            // For a one-way route from A->B on date/time X, seats used come from:
            //   1) "oneway" docs that match (from_location=A, to_location=B, pick_up_date=X, pick_up_time=X)
            //   2) "return" docs whose OUTBOUND leg is that same route/time
            //   3) "return" docs whose RETURN leg is that same route/time in REVERSE
            //      i.e. (from_location=B, to_location=A, return_pick_up_date=X, return_pick_up_time=X)
            // If you only want to see seats used on exactly the same direction,
            // remove or adjust the "return leg in reverse" condition.
            //------------------------------------------------------------------
            const bookings = await RidesModel.find({
                $or: [
                    // (A) Oneway with the same route/time
                    {
                        trip_type: 'oneway',
                        from_location,
                        to_location,
                        pick_up_date,
                        pick_up_time: { $regex: new RegExp(`^${pick_up_time}$`, 'i') }
                    },
                    // (B) Return with the same outbound route/time
                    {
                        trip_type: 'return',
                        from_location,
                        to_location,
                        pick_up_date,
                        pick_up_time: { $regex: new RegExp(`^${pick_up_time}$`, 'i') }
                    },
                    // (C) Return with the reversed route/time in the return leg
                    //     (From to_location -> from_location) if you consider that bus to be the same seats.
                    {
                        trip_type: 'return',
                        from_location: to_location,
                        to_location: from_location,
                        return_pick_up_date: pick_up_date,
                        return_pick_up_time: { $regex: new RegExp(`^${pick_up_time}$`, 'i') }
                    }
                ]
            });

            const totalTravelerCount = bookings.reduce(
                (sum, doc) => sum + (doc.traveler_count || 0),
                0
            );
            const seatsRemaining = Math.max(MAX_SEATS - totalTravelerCount, 0);

            return res.json({ seats_remaining: seatsRemaining });
        }

    } catch (err) {
        console.error(err);
        res.status(422).json({
            error: err,
            message: "Failed to fetch Seats Available information",
        });
    }
});

module.exports = router;