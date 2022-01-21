require('dotenv').config()

const SerialPort = require('serialport')
const Wyze = require('wyze-node')
const axios = require('axios')

const port = new SerialPort(process.env.COM_PORT, {
    baudRate: 115200,
    autoOpen: false
})

const props = {
    brightness: "P1501",
    color: "P1507"
};

const wyzeBulbModel = 'WLPA19C';

const wyze = new Wyze({
    username: process.env.WYZE_USERNAME,
    password: process.env.WYZE_PASSWORD
});

let devices = [];

wyze.getDeviceList().then(response => {
    devices = response.filter(device => device.product_model === wyzeBulbModel);
})

async function runActionList(instanceId, providerKey, actionKeys) {
    let result;

    try {
        await wyze.getTokens();

        if (!wyze.accessToken) {
            await wyze.login()
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

        result = await axios.post(`${wyze.baseUrl}/app/v2/auto/run_action_list`, await wyze.getRequestBodyData(data));

        if (result.data.msg === 'AccessTokenError') {
            await wyze.getRefreshToken();
            return runActionList(instanceId, providerKey, actionKeys);
        }
    } catch (e) {
        throw e;
    }

    return result.data;
}

function setBulbPreset(preset, bulb) {
    const actionList = [];

    if (!!preset.brightness) {
        actionList.push({
            key: "set_mesh_property",
            prop: props.brightness,
            value: preset['brightness'],
            device_mac: bulb.mac,
            provider_key: bulb.product_model,
        });
    }

    if (!!preset.color) {
        actionList.push({
            key: "set_mesh_property",
            prop: props.color,
            value: preset['color'],
            device_mac: bulb.mac,
            provider_key: bulb.product_model,
        });
    }

    if (actionList.length > 0) {
        runActionList(bulb.mac, bulb.product_model, actionList);
    }
}

function setPreset(presets) {
    if (presets instanceof Array) {
        for (let i = 0; i < presets.length && i < devices.length; i++) {
            setBulbPreset(presets[i], devices[i]);
        }
    } else {
        devices.forEach(bulb => setBulbPreset(presets, bulb));
    }
}

port.on('error', function (err) {
    console.log('Error: ', err.message)
})

port.on('data', function (data) {
    let json = new Buffer.from(data).toString();

    if (!!json) {
        json = json.replace(/\r?\n|\r/g, '').replace(/'/g, '"');
    }

    if (!!json) {
        try {
            json = JSON.parse(json);
            console.log('Command Recieved', json);
            setPreset(json);
        } catch (e) {
            console.log("Command failed", e);
        }
    }
})

port.open(function (e) {
    if (e) {
        return console.log('Error opening port: ', e.message)
    }
    console.log('Waiting for commands...');
})
