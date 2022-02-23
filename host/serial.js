const SerialPort = require('serialport')
const events = require('events');

module.exports = class Serial {

    /**
     * Class to manage serial communication between the host and pad
     * @param {string} port 
     * @param {number} baudrate 
     */
    constructor(port, baudrate) {

        this.connectionOpen = false;
        this.eventEmitter = new events.EventEmitter();

        // Construct the client
        this.client = new SerialPort(port, {
            baudRate: baudrate,
            autoOpen: false
        })

        // Handle error
        this.client.on('error', e => {
            console.log('Error: ', e.message)
        })

        // Handle close. Start trying to reconnect
        this.client.on("close", () => {
            console.log("Connection Closed");
            this.connectionOpen = false;
            this._reconnect();
        });

        // Handle data messages in by converting from binary and parsing as JSON
        this.client.on('data', data => {
            let json = new Buffer.from(data).toString();

            if (!!json) {
                json = json.replace(/\r?\n|\r/g, '').replace(/'/g, '"');
            }

            if (!!json) {
                try {
                    json = JSON.parse(json);
                    console.log('Command Recieved', json);

                    // Send the data out via event
                    this.eventEmitter.emit('data', json);
                } catch (e) {
                    console.log("Command failed", e, json);
                }
            }
        })

        // Start initial connect sequence
        console.log('Connecting...');
        this._reconnect();

        SerialPort.list().then(ports => {
            const device = ports.find(port => port.vendorId === '239A' && port.productId === '8108');
            console.log(device);
        });
    }

    /**
     * Handle reconnect sequence
     */
    _reconnect() {
        if (!this.connectionOpen) {
            this.client.open(e => this._onOpen(e))
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
            this._reconnect();
            return;
        }
        console.log('Waiting for commands...');
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
