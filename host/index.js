require('dotenv').config()

const express = require('express')
const bodyParser = require("body-parser");
const api = require("./api");
const SerialClient = require('./serial')
const WyzeClient = require('./wyze')

const wyze = new WyzeClient(process.env.WYZE_USERNAME, process.env.WYZE_PASSWORD)

const serial = new SerialClient(process.env.COM_PORT, 115200)

serial.onData(data => {
    wyze.setPreset(data);
})

const app = express()

app.use(express.static(process.cwd() + "/../web/dist/macropad/"));
app.use(bodyParser.json());
app.use('/api', api)

app.listen(process.env.WEB_PORT, () => {
    console.log(`Server listening on the port::${process.env.WEB_PORT}`);
});
