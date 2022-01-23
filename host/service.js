module.exports = class Service {

    /**
     * Class to handle service logic
     * 
     * @param {DB} db 
     * @param {Serial} serialPort 
     * @param {WyzeClient} wyze 
     */
    constructor(db, serialPort, wyze) {

        this.db = db;
        this.wyze = wyze;
        this.serial = serialPort;

        this.serial.onData(data => this._handleData(data));
        this.serial.onOpen(() => this._refreshPad());
    }

    /**
     * Gets the macros
     * @returns The macros as stored in the DB
     */
    getMacros() {
        return this.db.getMacros();
    }

    /**
     * Save the macro changes to the DB and update the pad
     * @param {*} macros 
     */
    saveMacros(macros) {
        this.db.saveMacros(macros);
        this._refreshPad();
    }

    /**
     * Send the configuration to the pad
     */
    _refreshPad() {
        const macros = this.db.getMacros()
        this.serial.write(JSON.stringify({
            apps: macros
        }))
    }

    /**
     * Handles data from the pad
     * @param {object} data JSON data from the pad
     */
    _handleData(data) {

        if (!data) {
            return;
        }

        if (data.wyze) {
            this.wyze.setPreset(data.wyze);
        }
    }

}
