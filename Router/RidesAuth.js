const express = require('express');
const router = express.Router(); 
require('dotenv').config();
const moment = require('moment');
const RidesModel = require('../Models/RideSchema.js');
const UserModel = require('../Models/UserSchema.js');
const RouteScheduleModel = require('../Models/RouteSchema');

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
        const { 
            acc_id, 
            payment_result, 
            pick_up_time, 
            pick_up_date, 
            traveler_count, 
            from_location, 
            to_location, 
            return_pick_up_time, 
            return_pick_up_date,
            trip_type
        } = req.body;

        // Validate required fields
        if (!acc_id || !pick_up_time || !pick_up_date || !traveler_count || !from_location || !to_location || !payment_result) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate user existence
        const user_data = await UserModel.findOne({ firebase_uid: acc_id });
        if (!user_data) {
            return res.status(422).json({ error: "User Not Found, Please Check your Mail" });
        }

        const acc_phone = user_data.phone;
        const acc_name = user_data.name;
        const booking_date = moment().format('YYYY-MM-DD');
        const ticket_id = await generateTicketId();

        // Create and save new ride booking
        const newRide = new RidesModel({
            ...req.body,
            ticket_id,
            booking_date,
            acc_phone,
            acc_name,
            payment_result: {
                payment_id: payment_result.payment_id,
                payment_status: payment_result.payment_status,
                paid_at: payment_result.paid_at,
                payment_email: payment_result.payment_email,
            },
        });

        // Save past ride details for user
        const pastRideDetails = {
            ticket_id,
            personCount: traveler_count,
            booking_date,
            trip_type,
            from_location,
            pick_up: req.body.pick_up,
            pick_up_date,
            pick_up_time,
            to_location,
            drop_off: req.body.drop_off,
            return_pick_up: req.body.return_pick_up,
            return_pick_up_date,
            return_pick_up_time,
            return_drop_off: req.body.return_drop_off,
            total_amount: req.body.total_amount,
            payment_ref_id: payment_result.payment_id,
            notes: req.body.notes,
        };
        user_data.past_rides.push(pastRideDetails);

        // Save new ride
        await newRide.save();
        await user_data.save();

        res.status(201).json({
            success: true,
            message: "Ride details posted successfully and schedules updated",
            data: newRide,
        });
    } catch (err) {
        console.error("Error booking ride:", err);
        res.status(500).json({
            error: err.message || err,
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
        res.status(500).json({
            error: err.message,
            message: "Failed to fetch Rides information",
        });
    }
});

router.get('/api/fetch_ride/:search', async (req, res) => {
    try{
        const search = req.params.search;
        const search_data = await RidesModel.findOne({ticket_id: search});

        if(!search_data){
            res.status(422).json({
                error: "Ride Not Found, Please Check Ticket ID"
            });
        } else {
            res.status(201).json(search_data);
        }
    } catch (err) {
        res.status(500).json({
            error: err.message,
            message: "Failed to fetch Ride Information"
        });
    }
});

router.get('/api/fetch_update_ride_details/:ticket_id', async (req, res) => {
    try {
        const { ticket_id } = req.params;
        const ride_data = await RidesModel.findOne(
            { ticket_id },
            'trip_type from_location to_location pick_up drop_off pick_up_time pick_up_date return_pick_up return_pick_up_date return_pick_up_time return_drop_off'
        );
    
        if (!ride_data) {
            return res.status(404).json({
                error: "Ride Not Found, Please Check Ticket ID and try again"
            });
        }

        return res.status(200).json(ride_data);
    } catch(err) {
        return res.status(500).json({
            error: err.message,
            message: "Failed to fetch ride information"
        });
    }
});

router.get('/api/fetch_rides_by_date/:date', async (req, res) => {
    try {
        const date = req.params.date?.trim();
        if (!date) {
            return res.status(400).json({ message: "Invalid date parameter" });
        }

        // 1) Fetch the route schedules to build the routes/time structure dynamically
        const scheduleData = await RouteScheduleModel.find({});
        if (!scheduleData || scheduleData.length === 0) {
            return res.status(404).json({ message: "No route schedules found" });
        }
        
        const routes = {};
        scheduleData.forEach(scheduleDoc => {
            // e.g. "RLA - STL", "STL - RLA", etc.
            const routeName = scheduleDoc.ride; 
            routes[routeName] = {};
            // For each pick_up_time, create an empty array
            scheduleDoc.pick_up_info.forEach(info => {
                routes[routeName][info.pick_up_time] = [];
            });
        });

        // 2) Fetch the rides/bookings for the given date from your RidesModel
        //    (both outbound or return date can be = date)
        const rides = await RidesModel.find({
            $or: [
                { pick_up_date: date },       // rides whose outbound date is date
                { return_pick_up_date: date } // rides whose return date is date
            ]
        }).lean();

        if (!rides || rides.length === 0) {
            // Even if no rides found, we still want to return the route/time structure
            // with "No rides available" for each slot
            for (const routeName in routes) {
                for (const timeKey in routes[routeName]) {
                    routes[routeName][timeKey].push({
                        message: "No rides available for this date and time"
                    });
                }
            }
            return res.status(200).json({ date, routes });
        }

        // Helper function to safely push an entry into the correct route/time
        function pushRideEntry(routeKey, timeKey, entry) {
            if (!routes[routeKey]) {
                // That route might not exist in scheduleData
                // e.g. a new route that isn't in the schedule yet, or a mismatch
                console.warn(`Route [${routeKey}] not found in scheduleData.`);
                return;
            }
            if (!routes[routeKey][timeKey]) {
                // That time might not exist for this route
                console.warn(`Time [${timeKey}] not found in route [${routeKey}].`);
                return;
            }
            routes[routeKey][timeKey].push(entry);
        }

        // 3) Loop over each ride and place it into the correct route/time
        rides.forEach(ride => {
            // Build an object representing the “outbound” portion
            const outboundEntry = {
                trip_type: ride.trip_type,
                ticket_id: ride.ticket_id,
                pick_up:   ride.pick_up,
                drop_off:  ride.drop_off,
                airline:   ride.airline,
                traveler_count: ride.traveler_count,
                acc_name:  ride.acc_name,
                acc_phone: ride.acc_phone,
                acc_email: ride.acc_email,
                notes:     ride.notes
            };

            // If the outbound leg is on this date:
            if (ride.pick_up_date === date) {
                const routeName = `${ride.from_location} - ${ride.to_location}`;
                // Only push if pick_up_time is defined
                if (ride.pick_up_time) {
                    pushRideEntry(routeName, ride.pick_up_time, outboundEntry);
                }
            }

            // If it’s a return trip and the return date = this date
            if (ride.trip_type === "return" && ride.return_pick_up_date === date) {
                // Build the “return” portion
                const returnEntry = {
                    trip_type: ride.trip_type,
                    ticket_id: ride.ticket_id,
                    pick_up:   ride.return_pick_up,
                    drop_off:  ride.return_drop_off,
                    airline:   ride.airline,
                    traveler_count: ride.traveler_count,
                    acc_name:  ride.acc_name,
                    acc_phone: ride.acc_phone,
                    acc_email: ride.acc_email,
                    notes:     ride.notes
                };
                // The return route is effectively reversed
                // If original route was RLA -> STL, return is STL -> RLA
                const reverseRouteName = `${ride.to_location} - ${ride.from_location}`;
                if (ride.return_pick_up_time) {
                    pushRideEntry(reverseRouteName, ride.return_pick_up_time, returnEntry);
                }
            }
        });

        // 4) Fill empty slots with a "No rides available" message
        for (const routeName in routes) {
            for (const timeKey in routes[routeName]) {
                if (routes[routeName][timeKey].length === 0) {
                    routes[routeName][timeKey].push({
                        message: "No rides available for this date and time"
                    });
                }
            }
        }

        // 5) Return final data
        return res.status(200).json({ date, routes });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message || err,
            message: "Failed to fetch Ride Information"
        });
    }
});

router.patch('/api/update_ride_details/:ticket_id', async (req, res) => {
    try{
        const ticket_id = req.params.ticket_id;
        const updates = {};

        const allowedUpdates = [
            'pick_up',
            'drop_off',
            'pick_up_time',
            'pick_up_date',
            'return_pick_up',
            'return_pick_up_date',
            'return_pick_up_time',
            'return_drop_off'
        ];

        allowedUpdates.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        const updatedRide = await RidesModel.findOneAndUpdate({ ticket_id: ticket_id }, updates, {new: true, runValidators: true});
        
        if(!updatedRide){
            return res.status(404).json({message: "Ride Not Found"});
        }
        res.status(201).json({
            "message": "Ride Succesfully Updated",
            updatedRide
        });
    } catch (err){
        res.status(500).json({
            error: err.message,
            message: "Failed to update ride details"
        });
    }
});

module.exports = router;