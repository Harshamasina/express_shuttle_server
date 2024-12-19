const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

require('./db/Conn');
app.use(require('./Router/UsersAuth'));
app.use(require('./Router/RidesAuth'));
app.use(require('./Router/LocationAuth'));
app.use(require('./Router/ContactAuth'));

app.listen(5000, () => {
    console.log(`server is running at port 5000`);
    console.log(`http://localhost:5000`);
});