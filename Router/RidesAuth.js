const express = require('express');
const router = express.Router(); 
require('dotenv').config();
const moment = require('moment');
const RidesModel = require('../Models/RideSchema.js');
const UserModel = require('../Models/UserSchema.js');
const RouteScheduleModel = require('../Models/RouteSchema.js');


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
        const booking_date = moment().format('YYYY-MM-DD');
        const ticket_id = await generateTicketId();

        // Create and save new ride booking
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

        // **Find the Correct Ride Schedule Using RouteScheduleModel**
        const rideSchedule = await RouteScheduleModel.findOne({ from_location, to_location });

        if (!rideSchedule) {
            return res.status(404).json({ error: "Ride schedule not found" });
        }

        // **Function to Update Ride Schedule Collection**
        const updateRideSchedule = async (schedule, selected_time, selected_date) => {
            const scheduleInfo = schedule.pick_up_info.find(info => info.pick_up_time === selected_time);
        
            if (!scheduleInfo) {
                return res.status(404).json({ error: "Pick-up time not found in schedule" });
            }

            // Format date as "YYYY-MM-DD" to avoid "T00:00:00.000Z"
            const formattedDate = moment(selected_date).format('YYYY-MM-DD');

            // Find existing date entry for the given date
            let dateEntryIndex = scheduleInfo.date_info.findIndex(date => date.pick_up_date === formattedDate);

            if (dateEntryIndex === -1) {
                // Create a new entry if no existing date entry is found
                scheduleInfo.date_info.push({
                    pick_up_date: formattedDate, // Store as "YYYY-MM-DD"
                    total_seats: 11, // Default total seats
                    seats_remaining: 11 - traveler_count, // Deduct booked seats
                    ticket_ids: [ticket_id]
                });
            } else {
                // Update existing entry
                scheduleInfo.date_info[dateEntryIndex].seats_remaining -= traveler_count;
                scheduleInfo.date_info[dateEntryIndex].ticket_ids.push(ticket_id);
            }

            await schedule.save();
        };                

        // **Update pick-up schedule for one-way trip**
        if (pick_up_time && pick_up_date) {
            await updateRideSchedule(rideSchedule, pick_up_time, pick_up_date);
        }

        // **Handle Return Ride for Round Trip**
        if (trip_type === "return" && return_pick_up_time && return_pick_up_date) {
            const returnRideSchedule = await RouteScheduleModel.findOne({
                from_location: to_location, 
                to_location: from_location
            });

            if (!returnRideSchedule) {
                return res.status(404).json({ error: "Return ride schedule not found" });
            }

            await updateRideSchedule(returnRideSchedule, return_pick_up_time, return_pick_up_date);
        }

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

module.exports = router;