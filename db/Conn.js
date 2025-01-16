const mongoose = require('mongoose');
require('dotenv').config();

const DB = process.env.MONGODB_URI_2 || 'fallback_connection_string';

mongoose.set('strictQuery', false);

const connectWithRetry = async () => {
    try {
        console.log('Attempting to connect to DB:', DB);
        await mongoose.connect(DB, {
            dbName: 'express_shuttle',
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000,          // 45 seconds
        });
        console.log('Database is Successfully Connected');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Error cause:', err.cause || 'Unknown');
        console.log('Retrying in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

connectWithRetry();
