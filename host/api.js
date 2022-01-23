const express = require('express')

module.exports = class Api {

    /**
     * Class to manage API communication from the web client
     * @param {Service} service 
     */
    constructor(service) {
        this.service = service;

        this.router = express.Router()

        /**
         * Get all macros
         */
        this.router.get('/', (req, res) => {
            res.send(this.service.getMacros())
        })

        /**
         * Update the set of macros
         */
        this.router.put('/', (req, res) => {
            res.send(this.service.saveMacros(req.body));
        })
    }

    /**
     * Get the Express router to use in API communication
     * @returns The Express router
     */
    getRouter() {
        return this.router;
    }

}
