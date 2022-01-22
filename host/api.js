const express = require('express')
const router = express.Router()
const DB = require('./db');

const db = new DB('./db/macros.json');

router.get('/', (req, res) => {
    res.send(db.getMacros())
})

router.put('/', (req, res) => {
    res.send(db.saveMacros(req.body));
})

module.exports = router;
