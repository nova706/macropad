require('dotenv').config()

const express = require('express')
const bodyParser = require("body-parser");
const Api = require("./api");
const DB = require('./db');
const SerialClient = require('./serial')
const WyzeClient = require('./wyze');
const Service = require('./service');

// Construct the classes
const wyze = new WyzeClient(process.env.WYZE_USERNAME, process.env.WYZE_PASSWORD)
const db = new DB('./db/macros.json');
const serial = new SerialClient(process.env.COM_PORT, 115200)

// Build the service class
const service = new Service(db, serial, wyze);

// Start Express
const app = express();

// Set up static assets, parser, and API
app.use(express.static(process.cwd() + "/../web/dist/macropad/"));
app.use(bodyParser.json());
app.use('/api', new Api(service).getRouter())

// Start listening to the Web Client
app.listen(process.env.WEB_PORT, () => {
    console.log(`Server listening on the port::${process.env.WEB_PORT}`);
});
