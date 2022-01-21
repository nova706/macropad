const SerialPort = require('serialport')
const events = require('events');

module.exports = class Serial {

    constructor(port, baudrate) {

        this.connectionOpen = false;

        this.client = new SerialPort(port, {
            baudRate: baudrate,
            autoOpen: false
        })

        this.client.on('error', e => {
            console.log('Error: ', e.message)
        })

        this.client.on("close", () => {
            console.log("Connection Closed");
            this.connectionOpen = false;
            this._reconnect();
        });

        this.client.on('data', data => {
            let json = new Buffer.from(data).toString();

            if (!!json) {
                json = json.replace(/\r?\n|\r/g, '').replace(/'/g, '"');
            }

            if (!!json) {
                try {
                    json = JSON.parse(json);
                    console.log('Command Recieved', json);
                    this.eventEmitter.emit('data', json);
                } catch (e) {
                    console.log("Command failed", e, json);
                }
            }
        })

        console.log('Connecting...');
        this._reconnect();

        this.eventEmitter = new events.EventEmitter();
    }

    _reconnect() {
        if (!this.connectionOpen) {
            this.client.open(e => this._onOpen(e))
        }
    }

    async _onOpen(e) {
        if (e) {
            await new Promise(r => setTimeout(r, 2000));
            console.log('Retrying Connection...');
            return this._reconnect();
        }
        console.log('Waiting for commands...');
        this.connectionOpen = true;
    }

    onData(func) {
        this.eventEmitter.on('data', func);
        return () => {
            this.eventEmitter.off('data', func);
        }
    }

}
