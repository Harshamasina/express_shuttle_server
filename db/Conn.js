const mongoose = require('mongoose');
require('dotenv').config();

const DB = process.env.MONGODB_URI_TEST || 'fallback_connection_string';

mongoose.set("strictQuery", false);

(async () => {
    try {
        console.log('Attempting to connect to DB:', DB);
        await mongoose.connect(DB, {
            dbName: 'express_shuttle',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database is Successfully Connected');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Error cause:', err.cause || 'Unknown');
    }
})();
