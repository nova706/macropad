import time
import serial
import os
import ast
from win32gui import GetWindowText, GetForegroundWindow
from wyze_sdk import Client
from wyze_sdk.errors import WyzeApiError

client = Client(email=os.environ.get('WYZE_USERNAME'),
                password=os.environ.get('WYZE_PASSWORD'))

devices = []

try:
    for device in client.devices_list():

        if device.product.model == 'WLPA19C':
            devices.append(device)

except WyzeApiError as e:
    # You will get a WyzeApiError is the request failed
    print(f"Got an error: {e}")

ser = None


def set_preset(presets):
    if isinstance(presets, list):
        for index in range(len(devices)):
            set_bulb_preset(presets[index], devices[index])
    else:
        for bulb in devices:
            set_bulb_preset(presets, bulb)


def set_bulb_preset(preset, bulb):
    if 'brightness' in preset.keys():
        client.bulbs.set_brightness(
            device_mac=bulb.mac, device_model=bulb.product.model, brightness=preset['brightness'])
    if 'color' in preset.keys():
        client.bulbs.set_color(
            device_mac=bulb.mac, device_model=bulb.product.model, color=preset['color'])


last_window_name = None
window_name = None

while (True):
    try:

        if (ser == None):

            # Reconnect serial port and get the reply ready
            ser = serial.Serial('COM4', 115200, timeout=0.1, write_timeout=1)
            reply = b''
            print("Reconnecting")
            print("Waiting for commands...")

        window_name = GetWindowText(GetForegroundWindow())
        if isinstance(window_name, str) and window_name.find('-') >= 0:
            window_name = window_name[window_name.rindex('-') + 2:]

        if not last_window_name == window_name:
            print(window_name)
            ser.write(str.encode(window_name))
            last_window_name = window_name

        # Read the output until a new line as a command
        a = ser.read()

        if a == b'\r':

            print(f"Command received: {reply}")

            try:
                set_preset(ast.literal_eval(reply.decode('utf-8')))
            except Exception as e:
                print(f"Command failed: {reply}: {e}")

            reply = b''

        else:
            reply += a

        time.sleep(0.01)

    except Exception as e:

        print(f"Serial failed: {e}")

        # Disconnect
        if (not(ser == None)):
            ser.close()
            ser = None
            print("Disconnecting")

        print("No Connection")
        time.sleep(2)
