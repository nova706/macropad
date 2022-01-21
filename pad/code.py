"""
A macro/hotkey program for Adafruit MACROPAD. Macro setups are stored in the
/macros folder (configurable below), load up just the ones you're likely to
use. Plug into computer's USB port, use dial to select an application macro
set, press MACROPAD keys to send key sequences and other USB protocols.
"""

# pylint: disable=import-error, unused-import, too-few-public-methods

import os
import time
import displayio
import terminalio
import time
import usb_cdc
from adafruit_display_shapes.rect import Rect
from adafruit_display_text import label
from adafruit_macropad import MacroPad
from adafruit_hid.consumer_control_code import ConsumerControlCode

from autoscreen import AutoOffScreen
from adafruit_displayio_sh1107_wrapper import SH1107_Wrapper

# CONFIGURABLES ------------------------

MACRO_FOLDER = '/macros'
STARTING_BRIGHTNESS = 0.10
INACTIVITY_TIMER = 15 * 60
OFF_DELAY = 0.75


# CLASSES AND FUNCTIONS ----------------

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
                macropad.pixels[i] = self.macros[i][0]
                group[i].text = self.macros[i][1]
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

# Load all the macro key setups from .py files in MACRO_FOLDER
apps = []
files = os.listdir(MACRO_FOLDER)
files.sort()
for filename in files:
    if filename.endswith('.py'):
        try:
            module = __import__(MACRO_FOLDER + '/' + filename[:-3])
            apps.append(App(module.app))
        except (SyntaxError, ImportError, AttributeError, KeyError, NameError,
                IndexError, TypeError) as err:
            pass

if not apps:
    group[13].text = 'NO MACRO FILES FOUND'
    macropad.display.refresh()
    while True:
        pass


def serial_read():
    return_value = None

    try:
        value = uart.readline()

        if value == None or value == b'':
            return_value = None
        else:
            return_value = value.decode()
    except:
        return_value = None

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


last_position = macropad.encoder
change = 0
app_index = 0
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
    if not serial_value == None:
        if serial_value.endswith('Visual Studio Code'):
            app_index = 2
            apps[app_index].switch()

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
        else:
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

    else:

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

        sequence = apps[app_index].macros[key_number][2]
        if pressed:
            # 'sequence' is an arbitrary-length list, each item is one of:
            # Positive integer (e.g. Keycode.KEYPAD_MINUS): key pressed
            # Negative integer: (absolute value) key released
            # Float (e.g. 0.25): delay in seconds
            # String (e.g. "Foo"): corresponding keys pressed & released
            # List []: one or more Consumer Control codes (can also do float delay)
            # Dict {}: mouse buttons/motion (might extend in future)
            if key_number < 12:  # No pixel for encoder button
                macropad.pixels[key_number] = 0xFFFFFF
                macropad.pixels.show()
            for item in sequence:

                if isinstance(item, int):
                    if item >= 0:
                        macropad.keyboard.press(item)
                    else:
                        macropad.keyboard.release(-item)
                elif isinstance(item, float):
                    time.sleep(item)
                elif isinstance(item, str):
                    macropad.keyboard_layout.write(item)
                elif isinstance(item, list):
                    for code in item:
                        if isinstance(code, int):
                            macropad.consumer_control.release()
                            macropad.consumer_control.press(code)
                        if isinstance(code, float):
                            time.sleep(code)
                elif isinstance(item, dict):
                    if 'buttons' in item:
                        if item['buttons'] >= 0:
                            macropad.mouse.press(item['buttons'])
                        else:
                            macropad.mouse.release(-item['buttons'])
                    macropad.mouse.move(item['x'] if 'x' in item else 0,
                                        item['y'] if 'y' in item else 0,
                                        item['wheel'] if 'wheel' in item else 0)
                    if 'tone' in item:
                        if item['tone'] > 0:
                            macropad.stop_tone()
                            macropad.start_tone(item['tone'])
                        else:
                            macropad.stop_tone()
                    elif 'rpc' in item:
                        serial_write(item['rpc'])
                    elif 'play' in item:
                        macropad.play_file(item['play'])

        else:
            # Release any still-pressed keys, consumer codes, mouse buttons
            # Keys and mouse buttons are individually released this way (rather
            # than release_all()) because pad supports multi-key rollover, e.g.
            # could have a meta key or right-mouse held down by one macro and
            # press/release keys/buttons with others. Navigate popups, etc.
            for item in sequence:
                if isinstance(item, int):
                    if item >= 0:
                        macropad.keyboard.release(item)
                elif isinstance(item, dict):
                    if 'buttons' in item:
                        if item['buttons'] >= 0:
                            macropad.mouse.release(item['buttons'])
            macropad.stop_tone()
            macropad.consumer_control.release()
            if key_number < 12:  # No pixel for encoder button
                macropad.pixels[key_number] = apps[app_index].macros[key_number][0]
                macropad.pixels.show()
