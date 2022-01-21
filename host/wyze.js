
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

    async runActionList(instanceId, providerKey, actionKeys) {
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
                return runActionList(instanceId, providerKey, actionKeys);
            }
        } catch (e) {
            throw e;
        }

        return result.data;
    }

    setBulbPreset(preset, bulb) {
        const actionList = [];

        if (!!preset.brightness) {
            actionList.push({
                key: "set_mesh_property",
                prop: WyzeClient.props.brightness,
                value: preset['brightness'],
                device_mac: bulb.mac,
                provider_key: bulb.product_model,
            });
        }

        if (!!preset.color) {
            actionList.push({
                key: "set_mesh_property",
                prop: WyzeClient.props.color,
                value: preset['color'],
                device_mac: bulb.mac,
                provider_key: bulb.product_model,
            });
        }

        if (actionList.length > 0) {
            this.runActionList(bulb.mac, bulb.product_model, actionList);
        }
    }

    setPreset(presets) {
        if (presets instanceof Array) {
            for (let i = 0; i < presets.length && i < this.devices.length; i++) {
                this.setBulbPreset(presets[i], this.devices[i]);
            }
        } else {
            this.devices.forEach(bulb => this.setBulbPreset(presets, bulb));
        }
    }


}
