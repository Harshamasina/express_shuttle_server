const express = require('express');
const router = express.Router();
require('dotenv').config();
const LocationModel = require('../Models/LocationSchema');

//Creating Drop Off and Pick Up Location
router.post('/api/location', async (req, res) => {
    try {
        const locationData = {...req.body};
        const location_code_exists = await LocationModel.findOne({ location_code: locationData.location_code });
        
        if(location_code_exists){
            return res.status(422).json({
                error: "Location Code Already Exists",
            });
        } else {
            const new_location = new LocationModel(locationData);
            await new_location.save();
            res.status(201).json({
                message: "New Location saved successfully",
                data: new_location,
            });
        }
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add Location information",
        });
    }
});

//Fetching Drop Off and Pick Up Location
router.get('/api/fetch_locations', async (req, res) => {
    try{
        const locations_data = await LocationModel.find({location_active: "true"});
        res.status(201).json(locations_data);
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to fetch Location information",
        });
    }
});

//Fetching all Drop Off and Pick Up Location
router.get('/api/fetch_all_locations', async (req, res) => {
    try{
        const locations_data = await LocationModel.find({});
        res.status(201).json(locations_data);
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to fetch Location information",
        });
    }
});

//Deleting Drop Off and Pick Up Location


//Updating Drop off and Pick Up Location
router.patch('/api/update_location/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const updates = {};
        
        for(const key in req.body){
            if(req.body[key] || req.body[key] === ''){
                updates[key] = req.body[key];
            }
        }
        const updatedLocation = await LocationModel.findByIdAndUpdate(id, updates, {new: true, runValidators: true});
        if(!updatedLocation){
            return res.status(404).json({message: "Location Not Found"});
        }
        res.status(201).json(updatedLocation);
    } catch (err) {
        res.status(500).json({
            error: err,
            message: "Failed to Update the Location Information"
        });
    }
});

module.exports = router;
