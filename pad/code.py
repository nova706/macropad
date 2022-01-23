"""
A macro/hotkey program for Adafruit MACROPAD. Macro setups are stored in the
/macros folder (configurable below), load up just the ones you're likely to
use. Plug into computer's USB port, use dial to select an application macro
set, press MACROPAD keys to send key sequences and other USB protocols.
"""

# pylint: disable=import-error, unused-import, too-few-public-methods

import time
import displayio
import json
import terminalio
import time
import usb_cdc
from adafruit_display_shapes.rect import Rect
from adafruit_display_text import label
from adafruit_macropad import MacroPad
from adafruit_hid.consumer_control_code import ConsumerControlCode
from adafruit_hid.keycode import Keycode
from adafruit_hid.mouse import Mouse

from autoscreen import AutoOffScreen
from adafruit_displayio_sh1107_wrapper import SH1107_Wrapper

# CONFIGURABLES ------------------------

STARTING_BRIGHTNESS = 0.01
INACTIVITY_TIMER = 15 * 60
OFF_DELAY = 0.75


# CLASSES AND FUNCTIONS ----------------

def get_color(macro):
    if 'color' in macro.keys():
        return int(macro['color'][1:], 16)
    else:
        return 0


class App:
    """ Class representing a host-side application, for which we have a set
        of macro sequences. Project code was originally more complex and
        this was helpful, but maybe it's excessive now?"""

    def __init__(self, appdata):
        self.name = appdata['name']
        self.macros = appdata['macros']

    def switch(self):
        """ Activate application settings; update OLED labels and LED
            colors. """
        group[13].text = '< ' + self.name + ' >'   # Application name
        for i in range(12):
            if i < len(self.macros):  # Key in use, set label + LED color
                macropad.pixels[i] = get_color(self.macros[i])
                group[i].text = self.macros[i]['name']
            else:  # Key not in use, no label or LED
                macropad.pixels[i] = 0
                group[i].text = ''
        macropad.keyboard.release_all()
        macropad.consumer_control.release()
        macropad.mouse.release_all()
        macropad.stop_tone()
        macropad.pixels.show()
        macropad.display.refresh()

# INITIALIZATION -----------------------


macropad = MacroPad()
macropad.display.auto_refresh = False
macropad.pixels.auto_write = False
macropad.pixels.brightness = STARTING_BRIGHTNESS

# Set up timeout to turn off lights after inactivity
autoscreen = AutoOffScreen(INACTIVITY_TIMER)
autoscreen.update_active()


# Use a mangled copy of the SH1107 python driver to add sleep ability to display.
display_sleeper = SH1107_Wrapper(macropad.display)

# When refreshing code, sometimes the screen doesn't turn back on, this seems to do the trick
display_sleeper.sleep()
display_sleeper.wake()

# Set serial data
uart = usb_cdc.data
uart.timeout = 0.01

# Set up displayio group with all the labels
group = displayio.Group()
for key_index in range(12):
    x = key_index % 3
    y = key_index // 3
    group.append(label.Label(terminalio.FONT, text='', color=0xFFFFFF,
                             anchored_position=((macropad.display.width - 1) * x / 2,
                                                macropad.display.height - 1 -
                                                (3 - y) * 12),
                             anchor_point=(x / 2, 1.0)))
group.append(Rect(0, 0, macropad.display.width, 12, fill=0xFFFFFF))
group.append(label.Label(terminalio.FONT, text='', color=0x000000,
                         anchored_position=(macropad.display.width//2, -2),
                         anchor_point=(0.5, 0.0)))
macropad.display.show(group)


apps = []
group[13].text = 'Waiting for Macros'
macropad.display.refresh()


def debug(text):
    group[13].text = str(text)
    macropad.display.refresh()


def serial_read():
    return_value = None

    try:
        value = uart.readline()

        if not (value == None or value == b''):
            value = value.decode()

        if isinstance(value, str):
            return_value = value
    except:
        pass

    return return_value


def serial_write(value):
    uart.write(bytearray(f"{value}\r".encode()))
    print(f"{value}\r")


def toggle_lights(on):
    if on:
        print("lights on!")
        display_sleeper.wake()
        macropad.pixels.brightness = brightness
        autoscreen.update_active()
    else:
        print("lights out")
        display_sleeper.sleep()
        macropad.pixels.brightness = 0
        autoscreen.turn_off = 1

    macropad.pixels.show()


def handle_serial(value):

    global apps
    global app_index
    global brightness

    try:
        value = json.loads(value)
    except:
        return

    # If sending list of apps, load them
    if 'apps' in value.keys():
        apps = []
        for app in value['apps']:
            apps.append(App(app))

        # If index out of range, show first app
        if app_index >= len(apps):
            app_index = 0
        if apps:
            apps[app_index].switch()

    if 'brightness' in value.keys():
        macropad.pixels.brightness = value['brightness']
        brightness = macropad.pixels.brightness
        macropad.pixels.show()

    # Switch app
    if 'index' in value.keys() and value['index'] < len(apps):
        app_index = value['index']
        apps[app_index].switch()


def get_command_value(command):
    if command['type'] == "TEXT":
        return command['text']
    elif command['text'].startswith("Keycode.") or command['text'].startswith("ConsumerControlCode.") or command['text'].startswith("Mouse."):
        return eval(command['text'])
    elif command['text'].startswith("-Keycode.") or command['text'].startswith("-Mouse."):
        return eval(command['text'][1:])
    else:
        return command['text']


last_position = macropad.encoder
change = 0
app_index = 0
if apps:
    apps[app_index].switch()

# Mode sets what function rotating the encoder performs
# 0: select app, 1: brightness, 2: volume, 3: scroll
# TODO: Allow configuration
mode = 0

last_light_status = True
brightness = macropad.pixels.brightness

start = time.time()
end = time.time()
encoder_pressed = False
encoder_released = False
encoder_down = False
lights_out = False

# MAIN LOOP ----------------------------
while True:

    lights_on = autoscreen.poll()
    if lights_on != last_light_status:
        toggle_lights(lights_on)
    last_light_status = lights_on

    # Read encoder position.
    position = macropad.encoder

    # Handle encoder button. If state has changed, cycle through the modes.
    macropad.encoder_switch_debounced.update()
    encoder_pressed = macropad.encoder_switch_debounced.pressed
    encoder_released = macropad.encoder_switch_debounced.released

    end = time.time()

    serial_value = serial_read()

    # handle incoming serial command
    if not serial_value == None and isinstance(serial_value, str):
        handle_serial(serial_value)

    # True if the encoder is released in this frame
    elif encoder_released:

        encoder_down = False

        # If the encoder was held down to shut off the lights
        if lights_out:
            lights_out = False
            continue

        autoscreen.update_active()
        if not lights_on:
            continue

        if mode == 0:
            mode = 1
            brightness = macropad.pixels.brightness
            group[13].text = '- LED: %' + \
                str(brightness * 100.0).rstrip('0').rstrip('.') + ' +'
            macropad.display.refresh()
        elif mode == 1:
            mode = 2
            group[13].text = '- Volume + '
            macropad.display.refresh()
        elif mode == 2:
            mode = 3
            group[13].text = '- Wheel +'
            macropad.display.refresh()
        else:
            mode = 0
            if not apps:
                group[13].text = 'NO MACRO FILES FOUND'
                macropad.display.refresh()
            else:
                apps[app_index].switch()

    # True if the encoder is pressed in this frame (not held down)
    elif encoder_pressed:

        encoder_down = True
        start = time.time()

    # True while the encoder is being held down
    elif encoder_down:

        if lights_on and (end - start) > OFF_DELAY:
            toggle_lights(False)
            lights_on = False
            last_light_status = False
            lights_out = True
            encoder_down = False

    # True if the encoder position has changed
    elif position != last_position:

        change = position - last_position
        last_position = position

        autoscreen.update_active()
        if not lights_on:
            continue

        if mode == 1:
            # If it's changed, change brightness. TODO: Store this value

            if change > 0:
                brightness = min(brightness + .05, 1)
            else:
                brightness = max(brightness - .05, 0)

            brightness = round(brightness, 2)

            macropad.pixels.brightness = brightness
            group[13].text = '- LED: %' + \
                str(brightness * 100.0).rstrip('0').rstrip('.') + ' +'
            macropad.display.refresh()
            macropad.pixels.show()
        elif mode == 2:
            if change > 0:
                macropad.consumer_control.send(
                    ConsumerControlCode.VOLUME_INCREMENT)
            else:
                macropad.consumer_control.send(
                    ConsumerControlCode.VOLUME_DECREMENT)
        elif mode == 3:
            if change > 0:
                macropad.mouse.move(0, 0, -1)
            else:
                macropad.mouse.move(0, 0, 1)
        elif apps:
            # If it's changed, switch apps.
            if change > 0:
                app_index = app_index + 1
            else:
                app_index = app_index - 1
            if app_index >= len(apps):
                app_index = 0
            elif app_index == -1:
                app_index = len(apps) - 1
            apps[app_index].switch()

    elif apps:

        # Encoder is not being used, check key press
        event = macropad.keys.events.get()
        if event:
            autoscreen.update_active()
            if not lights_on:
                continue

        if not event or event.key_number >= len(apps[app_index].macros):
            continue  # No key events, or no corresponding macro, resume loop

        key_number = event.key_number
        pressed = event.pressed

        # If code reaches here, a key WAS pressed/released
        # and there IS a corresponding macro available for it...other situations
        # are avoided by 'continue' statements above which resume the loop.

        commands = apps[app_index].macros[key_number]['commands']

        if pressed:

            if key_number < 12:  # No pixel for encoder button
                macropad.pixels[key_number] = 0xFFFFFF
                macropad.pixels.show()

            for command in commands:

                value = get_command_value(command)
                type = command['type']

                if type == "TEXT":
                    macropad.keyboard_layout.write(value)
                elif type == "KEYPRESS":
                    if isinstance(value, str):
                        macropad.keyboard_layout.write(value)
                    else:
                        macropad.keyboard.press(value)
                        macropad.keyboard.release(value)
                elif type == "CONSUMER_CONTROL":
                    macropad.consumer_control.release()
                    macropad.consumer_control.press(value)
                elif type == "MODIFIER_ON":
                    macropad.keyboard.press(value)
                elif type == "MODIFIER_OFF":
                    macropad.keyboard.release(value)
                elif type == "MOUSE_BUTTON":
                    if command['text'].startswith('-'):
                        macropad.mouse.release(value)
                    else:
                        macropad.mouse.press(value)
                elif type == "TONE":
                    macropad.start_tone(value)
                elif type == "TONE_STOP":
                    macropad.stop_tone()
                elif type == "WAIT":
                    time.sleep(value)
                elif type == "RPC":
                    serial_write(value)

                macropad.mouse.move(value if command['type'] == 'MOUSE_X' else 0,
                                    value if command['type'] == 'MOUSE_Y' else 0,
                                    value if command['type'] == 'MOUSE_WHEEL' else 0)

        else:

            # Release any still-pressed keys, consumer codes, mouse buttons
            # Keys and mouse buttons are individually released this way (rather
            # than release_all()) because pad supports multi-key rollover, e.g.
            # could have a meta key or right-mouse held down by one macro and
            # press/release keys/buttons with others. Navigate popups, etc.
            for item in command:

                value = get_command_value(command)
                if isinstance(value, int) and (command['type'] == "KEYPRESS" or command['type'] == "MODIFIER_ON"):
                    macropad.keyboard.release(value)
                elif isinstance(value, int) and command['type'] == "MOUSE_BUTTON":
                    macropad.mouse.release(value)

            macropad.stop_tone()
            macropad.consumer_control.release()

            if key_number < 12:  # No pixel for encoder button
                macropad.pixels[key_number] = get_color(
                    apps[app_index].macros[key_number])
                macropad.pixels.show()
