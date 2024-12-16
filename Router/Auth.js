const express = require('express');
const router = express.Router();
const { default: mongoose } = require('mongoose');
require('dotenv').config();

router.get('/', (req , res) => {
    res.send(`Hello from Express Shuttle Services`)
});

module.exports = router;
