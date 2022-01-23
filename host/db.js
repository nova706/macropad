const JSONdb = require('simple-json-db');
const { v4: uuidv4 } = require('uuid');

module.exports = class DB {

    /**
     * Class to handle storage and retrieval of data
     * @param {string} path The database file path
     */
    constructor(path) {
        this.db = new JSONdb(path);
        this.cache = this._get();

        if (!this.cache) {
            this.cache = {
                macros: [],
                favorites: []
            };
            this._save();
        }
    }

    /**
     * Gets all the data from the DB file
     * @returns All data
     */
    _get() {
        return this.db.JSON();
    }

    /**
     * Saves the cached data to the DB file
     */
    _save() {
        this.db.JSON(this.cache);
    }

    /**
     * Gets the macros
     * @returns Macros
     */
    getMacros() {
        if (!this.cache.macros) {
            this.cache.macros = [];
        }

        return this.cache.macros;
    }

    /**
     * Saves all macros (create/update/delete) and returns the new set
     * @param {*} macros the macros to save
     * @returns all macros
     */
    saveMacros(macros) {
        if (!this.cache.macros) {
            this.cache.macros = [];
        }

        const idsToKeep = [];

        macros.forEach(update => {
            if (update.id) {

                // Update existing macros
                idsToKeep.push(update.id);
                const found = this.getMacros().find(macro => macro.id === update.id);

                if (found) {
                    Object.assign(found, update);
                }
            } else {

                // Create new macros
                update.id = uuidv4();
                idsToKeep.push(update.id);
                this.cache.macros.push(update);
            }
        });

        // Delete macros not in the update
        this.cache.macros = this.cache.macros.filter(macro => idsToKeep.indexOf(macro.id) >= 0);

        this._save();

        return this.cache.macros;
    }

    /**
     * Get a macro by ID
     * @param {string} id The macro ID
     * @returns The Macro
     */
    getMacro(id) {
        return this.getMacros().find(macro => macro.id === id);
    }

    /**
     * Creates a new Macro
     * @param {*} macro The macro to create
     * @returns the created macro
     */
    createMacro(macro) {
        macro.id = uuidv4();
        if (!this.cache.macros) {
            this.cache.macros = [];
        }
        this.cache.macros.push(macro);

        this._save();

        return macro;
    }

    /**
     * Updates a macro by ID
     * @param {string} id The ID of the macro to update
     * @param {*} macro The macro
     * @returns The updated macro if found
     */
    updateMacro(id, macro) {
        const found = this.getMacros().find(macro => macro.id === id);

        if (found) {
            Object.assign(found, macro);
            this._save();
        }

        return found;
    }

    /**
     * Delete a macro by ID
     * @param {string} id The ID of the macro to delet
     */
    deleteMacro(id) {
        const found = this.getMacros().find(macro => macro.id === id);

        if (found) {
            this.cache.macros.splice(this.cache.macros.indexOf(found), 1);
            this._save();
        }
    }
}
