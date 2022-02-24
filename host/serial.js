const SerialPort = require('serialport')
const events = require('events');

module.exports = class Serial {

    static ADAFRUIT_VENDOR_ID = '239A';
    static MACROPAD_PRODUCT_ID = '8108';
    static MACROPAD_BAUDRATE = 115200;

    /**
     * Class to manage serial communication between the host and pad
     */
    constructor() {

        this.connectionOpen = false;
        this.eventEmitter = new events.EventEmitter();

        // Start initial connect sequence
        console.log('Connecting...');
        this._reconnect();
    }

    async _getClient() {

        let client = null;

        const ports = await SerialPort.list();
        const devices = ports.filter(port => port.vendorId === Serial.ADAFRUIT_VENDOR_ID && port.productId === Serial.MACROPAD_PRODUCT_ID);

        if (devices.length > 0) {
            const port = devices[devices.length - 1].path;

            // Construct the client
            client = new SerialPort(port, {
                baudRate: Serial.MACROPAD_BAUDRATE,
                autoOpen: false
            })

            // Handle error
            client.on('error', e => {
                console.log('Error: ', e.message)
            })

            // Handle close. Start trying to reconnect
            client.on("close", () => {
                console.log("Connection Closed");
                this.connectionOpen = false;
                this._reconnect();
            });

            // Handle data messages in by converting from binary and parsing as JSON
            client.on('data', data => {
                let json = new Buffer.from(data).toString();

                if (!!json) {
                    json = json.replace(/\r?\n|\r/g, '').replace(/'/g, '"');
                }

                if (!!json) {
                    try {
                        json = JSON.parse(json);
                        console.log('Command Received', json);

                        // Send the data out via event
                        this.eventEmitter.emit('data', json);
                    } catch (e) {
                        console.log("Command failed", e, json);
                    }
                }
            })
        }

        return client;
    }

    /**
     * Handle reconnect sequence
     */
    async _reconnect() {
        if (!this.connectionOpen) {

            this.client = await this._getClient();

            if (this.client) {
                this.client.open(e => this._onOpen(e))
            } else {
                await new Promise(r => setTimeout(r, 2000));
                console.log('Retrying Connection...');
                await this._reconnect();
            }
        }
    }

    /**
     * Handles trying to open the connection. If fails, sleeps and tries to reconnect
     * @param {*} e error
     */
    async _onOpen(e) {
        if (e) {
            await new Promise(r => setTimeout(r, 2000));
            console.log('Retrying Connection...');
            await this._reconnect();
            return;
        }
        console.log('Waiting for commands on ' + this.client.path + '...');
        this.eventEmitter.emit('open');

        this.connectionOpen = true;
    }

    /**
     * Writes a JSON string to the pad
     * @param {string} content Content to write to the serial port parsed as JSON
     */
    write(content) {
        this.client.write(content);
    }

    /**
     * Subscribes to the open event
     * @param {function} func The listener
     * @returns A function to stop listening
     */
    onOpen(func) {
        this.eventEmitter.on('open', func);
        return () => {
            this.eventEmitter.off('open', func);
        }
    }

    /**
     * Subscribes to the data event
     * @param {function} func The listener provided the JSON data
     * @returns A function to stop listening
     */
    onData(func) {
        this.eventEmitter.on('data', func);
        return () => {
            this.eventEmitter.off('data', func);
        }
    }

}
