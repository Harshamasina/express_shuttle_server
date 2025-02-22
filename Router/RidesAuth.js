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
          error: "Ride Not Found, Please Check Ticket ID"
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
        const date = req.params.date;
        if (!date) {
            return res.status(400).json({ message: "Invalid date parameter" });
        }

        const rides = await RidesModel.find({
            $or: [
                { pick_up_date: date },
                { return_pick_up_date: date }
            ]
        }).lean();

        if (!rides || rides.length === 0) {
            return res.status(404).json({ message: "No rides found for the given date" });
        }

        const routes = {
            "RLA-STL": { "5:00 AM": [], "12:00 PM": [], "5:00 PM": [] },
            "STL-RLA": { "8:00 AM": [], "2:00 PM": [], "7:00 PM": [] },
            "RLA-CLB": { "5:00 AM": [], "12:00 PM": [], "5:00 PM": [] },
            "CLB-RLA": { "7:00 PM": [] }
        };

        rides.forEach(ride => {
            if (!ride.pick_up_time) {
                console.log("Skipping ride due to missing pick_up_time:", ride);
                return;
            }
            const rideEntry = {
                trip_type: ride.trip_type,
                ticket_id: ride.ticket_id,
                pick_up: ride.pick_up,
                drop_off: ride.drop_off,
                airline: ride.airline,
                traveler_count: ride.traveler_count,
                acc_name: ride.acc_name,
                acc_phone: ride.acc_phone,
                acc_email: ride.acc_email,
                notes: ride.notes
            };

            if (ride.from_location === "RLA" && ride.to_location === "STL" && routes["RLA-STL"][ride.pick_up_time]) {
                routes["RLA-STL"][ride.pick_up_time].push(rideEntry);
            } else if (ride.from_location === "STL" && ride.to_location === "RLA" && routes["STL-RLA"][ride.pick_up_time]) {
                routes["STL-RLA"][ride.pick_up_time].push(rideEntry);
            } else if (ride.from_location === "RLA" && ride.to_location === "CLB" && routes["RLA-CLB"][ride.pick_up_time]) {
                routes["RLA-CLB"][ride.pick_up_time].push(rideEntry);
            } else if (ride.from_location === "CLB" && ride.to_location === "RLA" && routes["CLB-RLA"][ride.pick_up_time]) {
                routes["CLB-RLA"][ride.pick_up_time].push(rideEntry);
            }

            // Handle return trips
            if (ride.trip_type === "return" && ride.return_pick_up_date === date && ride.return_pick_up_time) {
                const returnRideEntry = {
                    trip_type: ride.trip_type,
                    ticket_id: ride.ticket_id,
                    pick_up: ride.return_pick_up,
                    drop_off: ride.return_drop_off,
                    airline: ride.airline,
                    traveler_count: ride.traveler_count,
                    acc_name: ride.acc_name,
                    acc_phone: ride.acc_phone,
                    acc_email: ride.acc_email,
                    notes: ride.notes
                };

                if (ride.to_location === "RLA" && ride.from_location === "STL" && routes["STL-RLA"][ride.return_pick_up_time]) {
                    routes["STL-RLA"][ride.return_pick_up_time].push(returnRideEntry);
                } else if (ride.to_location === "STL" && ride.from_location === "RLA" && routes["RLA-STL"][ride.return_pick_up_time]) {
                    routes["RLA-STL"][ride.return_pick_up_time].push(returnRideEntry);
                } else if (ride.to_location === "CLB" && ride.from_location === "RLA" && routes["RLA-CLB"][ride.return_pick_up_time]) {
                    routes["RLA-CLB"][ride.return_pick_up_time].push(returnRideEntry);
                } else if (ride.to_location === "RLA" && ride.from_location === "CLB" && routes["CLB-RLA"][ride.return_pick_up_time]) {
                    routes["CLB-RLA"][ride.return_pick_up_time].push(returnRideEntry);
                }
            }
        });

        // Add message for empty time slots
        for (const route in routes) {
            for (const time in routes[route]) {
                if (routes[route][time].length === 0) {
                    routes[route][time] = [{ message: "No rides available for this date and time" }];
                }
            }
        }

        res.status(200).json({date, routes});
    } catch (err) {
        res.status(500).json({
            error: err.message,
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