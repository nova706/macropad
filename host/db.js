const JSONdb = require('simple-json-db');
const { v4: uuidv4 } = require('uuid');

module.exports = class DB {

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

    _get() {
        return this.db.JSON();
    }

    _save() {
        this.db.JSON(this.cache);
    }

    getMacros() {
        if (!this.cache.macros) {
            this.cache.macros = [];
        }

        return this.cache.macros;
    }

    saveMacros(macros) {
        if (!this.cache.macros) {
            this.cache.macros = [];
        }

        macros.forEach(update => {
            if (update.id) {
                const found = this.getMacros().find(macro => macro.id === update.id);

                if (found) {
                    Object.assign(found, update);
                }
            } else {
                update.id = uuidv4();
                this.cache.macros.push(update);
            }
        });

        this._save();

        return this.cache.macros;
    }

    getMacro(id) {
        return this.getMacros().find(macro => macro.id === id);
    }

    createMacro(macro) {
        macro.id = uuidv4();
        if (!this.cache.macros) {
            this.cache.macros = [];
        }
        this.cache.macros.push(macro);

        this._save();
    }

    updateMacro(id, macro) {
        const found = this.getMacros().find(macro => macro.id === id);

        if (found) {
            Object.assign(found, macro);
            this._save();
        }
    }

    deleteMacro(id) {
        const found = this.getMacros().find(macro => macro.id === id);

        if (found) {
            this.cache.macros.splice(this.cache.macros.indexOf(found), 1);
            this._save();
        }
    }
}
