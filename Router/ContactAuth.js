const express = require('express');
const router = express.Router();
require('dotenv').config();
const ContactModel = require('../Models/ContactSchema');

//Posting Contact Message
router.post('/api/message', async (req, res) => {
    try {
        const contactData = {...req.body};
        const newMessage = new ContactModel(contactData);
        await newMessage.save();
        res.status(201).json({
            message: "New Message saved successfully",
            data: newMessage,
        });
    } catch (err) {
        console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to add message information",
        });
    }
});

//Fetching User Message
router.get('/api/fetch_messages', async (req, res) => {
    try {
        const messages_data = await ContactModel.find({});
        return res.status(201).json({messages_data});
    } catch (err) {
        res.status(422).json({
            error: err,
            message: "Failed to delete message information",
        });
    }
});

//Deleting Contact Message
router.delete('/api/delete_message/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const contactMessage = await ContactModel.findById(id);

        if(!contactMessage){
            return res.status(404).json({error: "Notification not found"});
        }
        const deleteMessage = await ContactModel.findByIdAndDelete(id);
        return res.status(201).json({
            deleteMessage,
            message: "Successfully Deleted Message"
        });
    } catch (err) {
        // console.log(err);
        res.status(422).json({
            error: err,
            message: "Failed to delete message information",
        });
    }
});

module.exports = router;