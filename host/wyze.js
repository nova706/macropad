
const Wyze = require('wyze-node')
const axios = require('axios')

module.exports = class WyzeClient {

    constructor(username, password) {
        this.wyze = new Wyze({
            username: username,
            password: password
        });

        this.devices = [];

        this.wyze.getDeviceList().then(response => {
            this.devices = response.filter(device => device.product_model === WyzeClient.wyzeBulbModel);
        })
    }

    static wyzeBulbModel = 'WLPA19C';

    static props = {
        brightness: "P1501",
        color: "P1507"
    };

    /**
     * Set wyze bulb color preset (brightness: int 0-100, color: hex without #)
     * @param {*} presets 
     */
    setPreset(presets) {

        let actionList = [];

        if (presets instanceof Array) {
            for (let i = 0; i < presets.length && i < this.devices.length; i++) {
                actionList = actionList.concat(this._getBulbPresetActions(this.devices[i], presets[i]));
            }
        } else {
            this.devices.forEach(bulb => {
                actionList = actionList.concat(this._getBulbPresetActions(bulb, presets));
            });
        }

        if (actionList.length > 0) {
            this._runActionList(actionList[0].device_mac, actionList[0].provider_key, actionList);
        }
    }

    /**
     * Gets a list of actions to run for a bulb based on preset values
     * @param {*} bulb Wyze Bulb Color
     * @param {*} preset Preset data for bulb properties
     * @returns The list of actions to run
     */
    _getBulbPresetActions(bulb, preset) {
        const actionList = [];

        if (!!preset.brightness) {
            actionList.push({
                key: "set_mesh_property",
                prop: WyzeClient.props.brightness,
                value: preset.brightness,
                device_mac: bulb.mac,
                provider_key: bulb.product_model,
            });
        }

        if (!!preset.color) {
            actionList.push({
                key: "set_mesh_property",
                prop: WyzeClient.props.color,
                value: preset.color,
                device_mac: bulb.mac,
                provider_key: bulb.product_model,
            });
        }

        return actionList;
    }

    /**
     * Runs a set of actions on the Wyze API
     * @param {string} instanceId Action list instance ID (MAC)
     * @param {string} providerKey Action list provider key (product)
     * @param {*[]} actionKeys actionKeys used to build the list of actions to send
     * @returns resulting data
     */
    async _runActionList(instanceId, providerKey, actionKeys) {
        let result;

        try {
            await this.wyze.getTokens();

            if (!this.wyze.accessToken) {
                await this.wyze.login()
            }

            const data = {
                action_list: [],
                custom_string: '',
            }

            if (!(actionKeys instanceof Array)) {
                actionKeys = [actionKeys];
            }

            actionKeys.forEach(actionKey => {
                data.action_list.push(
                    {
                        action_key: actionKey.key,
                        action_params: {
                            list: [
                                {
                                    mac: actionKey.device_mac,
                                    plist: [
                                        {
                                            pid: actionKey.prop,
                                            pvalue: actionKey.value.toString()
                                        }
                                    ]
                                }
                            ]
                        },
                        instance_id: actionKey.device_mac,
                        provider_key: actionKey.provider_key
                    }
                );
            });

            result = await axios.post(`${this.wyze.baseUrl}/app/v2/auto/run_action_list`, await this.wyze.getRequestBodyData(data));

            if (result.data.msg === 'AccessTokenError') {
                await this.wyze.getRefreshToken();
                return _runActionList(instanceId, providerKey, actionKeys);
            }
        } catch (e) {
            throw e;
        }

        return result.data;
    }
}
