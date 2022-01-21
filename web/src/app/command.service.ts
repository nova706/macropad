import { Injectable } from '@angular/core';
import { CommandType } from './enums/command-type';
import { ConsumerControlCode } from './enums/consumer-control-code';
import { Keycode } from './enums/keycode';
import { MouseButton } from './enums/mouse-button';
import { Command } from './interfaces/command';

@Injectable({
    providedIn: 'root'
})
export class CommandService {

    constructor() { }

    static release(keycode: string) {
        return '-' + keycode;
    }

    static getCommands(): Array<Command> {

        // TODO: Left and Right Modifiers and Keypad, Media, Mouse
        return [
            {
                text: Keycode.CONTROL,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Control'
            },
            {
                text: Keycode.SHIFT,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Shift'
            },
            {
                text: Keycode.ALT,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Alt'
            },
            {
                text: Keycode.WINDOWS,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Windows'
            },
            {
                text: Keycode.OPTION,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Option'
            },
            {
                text: Keycode.COMMAND,
                type: CommandType.MODIFIER_ON,
                name: 'Hold Command'
            },
            {
                text: CommandService.release(Keycode.CONTROL),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Control'
            },
            {
                text: CommandService.release(Keycode.SHIFT),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Shift'
            },
            {
                text: CommandService.release(Keycode.ALT),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Alt'
            },
            {
                text: CommandService.release(Keycode.WINDOWS),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Windows'
            },
            {
                text: CommandService.release(Keycode.OPTION),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Option'
            },
            {
                text: CommandService.release(Keycode.COMMAND),
                type: CommandType.MODIFIER_OFF,
                name: 'Release Command'
            },
            {
                text: Keycode.SPACE,
                type: CommandType.KEYPRESS,
                name: 'Press Space'
            },
            {
                text: Keycode.COMMA,
                type: CommandType.KEYPRESS,
                name: 'Press ,'
            },
            {
                text: Keycode.PERIOD,
                type: CommandType.KEYPRESS,
                name: 'Press .'
            },
            {
                text: Keycode.FORWARD_SLASH,
                type: CommandType.KEYPRESS,
                name: 'Press /'
            },
            {
                text: Keycode.SEMI_COLON,
                type: CommandType.KEYPRESS,
                name: 'Press ;'
            },
            {
                text: Keycode.QUOTE,
                type: CommandType.KEYPRESS,
                name: 'Press \''
            },
            {
                text: Keycode.LEFT_BRACKET,
                type: CommandType.KEYPRESS,
                name: 'Press ['
            },
            {
                text: Keycode.RIGHT_BRACKET,
                type: CommandType.KEYPRESS,
                name: 'Press ]'
            },
            {
                text: Keycode.BACKSLASH,
                type: CommandType.KEYPRESS,
                name: 'Press \\'
            },
            {
                text: Keycode.GRAVE_ACCENT,
                type: CommandType.KEYPRESS,
                name: 'Press `'
            },
            {
                text: Keycode.ARROW_UP,
                type: CommandType.KEYPRESS,
                name: 'Press Arrow Up'
            },
            {
                text: Keycode.ARROW_DOWN,
                type: CommandType.KEYPRESS,
                name: 'Press Arrow Down'
            },
            {
                text: Keycode.ARROW_LEFT,
                type: CommandType.KEYPRESS,
                name: 'Press Arrow Left'
            },
            {
                text: Keycode.ARROW_RIGHT,
                type: CommandType.KEYPRESS,
                name: 'Press Arrow Right'
            },
            {
                text: Keycode.CAPS_LOCK,
                type: CommandType.KEYPRESS,
                name: 'Press Capslock'
            },
            {
                text: Keycode.ENTER,
                type: CommandType.KEYPRESS,
                name: 'Press Enter'
            },
            {
                text: Keycode.TAB,
                type: CommandType.KEYPRESS,
                name: 'Press Tab'
            },
            {
                text: Keycode.BACKSPACE,
                type: CommandType.KEYPRESS,
                name: 'Press Backspace'
            },
            {
                text: Keycode.ESCAPE,
                type: CommandType.KEYPRESS,
                name: 'Press Escape'
            },
            {
                text: Keycode.F1,
                type: CommandType.KEYPRESS,
                name: 'Press F1'
            },
            {
                text: Keycode.F2,
                type: CommandType.KEYPRESS,
                name: 'Press F2'
            },
            {
                text: Keycode.F3,
                type: CommandType.KEYPRESS,
                name: 'Press F3'
            },
            {
                text: Keycode.F4,
                type: CommandType.KEYPRESS,
                name: 'Press F4'
            },
            {
                text: Keycode.F5,
                type: CommandType.KEYPRESS,
                name: 'Press F5'
            },
            {
                text: Keycode.F6,
                type: CommandType.KEYPRESS,
                name: 'Press F6'
            },
            {
                text: Keycode.F7,
                type: CommandType.KEYPRESS,
                name: 'Press F7'
            },
            {
                text: Keycode.F8,
                type: CommandType.KEYPRESS,
                name: 'Press F8'
            },
            {
                text: Keycode.F9,
                type: CommandType.KEYPRESS,
                name: 'Press F9'
            },
            {
                text: Keycode.F10,
                type: CommandType.KEYPRESS,
                name: 'Press F10'
            },
            {
                text: Keycode.F11,
                type: CommandType.KEYPRESS,
                name: 'Press F11'
            },
            {
                text: Keycode.F12,
                type: CommandType.KEYPRESS,
                name: 'Press F12'
            },
            {
                text: Keycode.PRINT_SCREEN,
                type: CommandType.KEYPRESS,
                name: 'Press Print Screen'
            },
            {
                text: Keycode.SCROLL_LOCK,
                type: CommandType.KEYPRESS,
                name: 'Press Scroll Lock'
            },
            {
                text: Keycode.PAUSE,
                type: CommandType.KEYPRESS,
                name: 'Press Pause'
            },
            {
                text: Keycode.INSERT,
                type: CommandType.KEYPRESS,
                name: 'Press Insert'
            },
            {
                text: Keycode.HOME,
                type: CommandType.KEYPRESS,
                name: 'Press Home'
            },
            {
                text: Keycode.END,
                type: CommandType.KEYPRESS,
                name: 'Press End'
            },
            {
                text: Keycode.PAGE_UP,
                type: CommandType.KEYPRESS,
                name: 'Press Page Up'
            },
            {
                text: Keycode.PAGE_DOWN,
                type: CommandType.KEYPRESS,
                name: 'Press Page Down'
            },
            {
                text: Keycode.DELETE,
                type: CommandType.KEYPRESS,
                name: 'Press Delete'
            },
            {
                text: Keycode.NUM_LOCK,
                type: CommandType.KEYPRESS,
                name: 'Press Num Lock'
            },
            {
                text: Keycode.POWER,
                type: CommandType.KEYPRESS,
                name: 'Press Power'
            },
            {
                text: '1',
                type: CommandType.KEYPRESS,
                name: 'Press 1'
            },
            {
                text: '2',
                type: CommandType.KEYPRESS,
                name: 'Press 2'
            },
            {
                text: '3',
                type: CommandType.KEYPRESS,
                name: 'Press 3'
            },
            {
                text: '4',
                type: CommandType.KEYPRESS,
                name: 'Press 4'
            },
            {
                text: '5',
                type: CommandType.KEYPRESS,
                name: 'Press 5'
            },
            {
                text: '6',
                type: CommandType.KEYPRESS,
                name: 'Press 6'
            },
            {
                text: '7',
                type: CommandType.KEYPRESS,
                name: 'Press 7'
            },
            {
                text: '8',
                type: CommandType.KEYPRESS,
                name: 'Press 8'
            },
            {
                text: '9',
                type: CommandType.KEYPRESS,
                name: 'Press 9'
            },
            {
                text: '0',
                type: CommandType.KEYPRESS,
                name: 'Press 0'
            },
            {
                text: 'a',
                type: CommandType.KEYPRESS,
                name: 'Press A'
            },
            {
                text: 'b',
                type: CommandType.KEYPRESS,
                name: 'Press B'
            },
            {
                text: 'c',
                type: CommandType.KEYPRESS,
                name: 'Press C'
            },
            {
                text: 'd',
                type: CommandType.KEYPRESS,
                name: 'Press D'
            },
            {
                text: 'e',
                type: CommandType.KEYPRESS,
                name: 'Press E'
            },
            {
                text: 'f',
                type: CommandType.KEYPRESS,
                name: 'Press F'
            },
            {
                text: 'g',
                type: CommandType.KEYPRESS,
                name: 'Press G'
            },
            {
                text: 'h',
                type: CommandType.KEYPRESS,
                name: 'Press H'
            },
            {
                text: 'i',
                type: CommandType.KEYPRESS,
                name: 'Press I'
            },
            {
                text: 'j',
                type: CommandType.KEYPRESS,
                name: 'Press J'
            },
            {
                text: 'k',
                type: CommandType.KEYPRESS,
                name: 'Press K'
            },
            {
                text: 'l',
                type: CommandType.KEYPRESS,
                name: 'Press L'
            },
            {
                text: 'm',
                type: CommandType.KEYPRESS,
                name: 'Press M'
            },
            {
                text: 'n',
                type: CommandType.KEYPRESS,
                name: 'Press N'
            },
            {
                text: 'o',
                type: CommandType.KEYPRESS,
                name: 'Press O'
            },
            {
                text: 'p',
                type: CommandType.KEYPRESS,
                name: 'Press P'
            },
            {
                text: 'q',
                type: CommandType.KEYPRESS,
                name: 'Press Q'
            },
            {
                text: 'r',
                type: CommandType.KEYPRESS,
                name: 'Press R'
            },
            {
                text: 's',
                type: CommandType.KEYPRESS,
                name: 'Press S'
            },
            {
                text: 't',
                type: CommandType.KEYPRESS,
                name: 'Press T'
            },
            {
                text: 'u',
                type: CommandType.KEYPRESS,
                name: 'Press U'
            },
            {
                text: 'v',
                type: CommandType.KEYPRESS,
                name: 'Press V'
            },
            {
                text: 'w',
                type: CommandType.KEYPRESS,
                name: 'Press W'
            },
            {
                text: 'x',
                type: CommandType.KEYPRESS,
                name: 'Press X'
            },
            {
                text: 'y',
                type: CommandType.KEYPRESS,
                name: 'Press Y'
            },
            {
                text: 'z',
                type: CommandType.KEYPRESS,
                name: 'Press Z'
            },
            {
                text: ConsumerControlCode.PLAY_PAUSE,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Play / Pause'
            },
            {
                text: ConsumerControlCode.SCAN_NEXT_TRACK,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Next Track'
            },
            {
                text: ConsumerControlCode.SCAN_PREVIOUS_TRACK,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Previous Track'
            },
            {
                text: ConsumerControlCode.FAST_FORWARD,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Fast Forward'
            },
            {
                text: ConsumerControlCode.REWIND,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Rewind'
            },
            {
                text: ConsumerControlCode.STOP,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Stop'
            },
            {
                text: ConsumerControlCode.RECORD,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Record'
            },
            {
                text: ConsumerControlCode.EJECT,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Eject'
            },
            {
                text: ConsumerControlCode.MUTE,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Mute'
            },
            {
                text: ConsumerControlCode.VOLUME_DECREMENT,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Decrease Volume'
            },
            {
                text: ConsumerControlCode.VOLUME_INCREMENT,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Increase Volume'
            },
            {
                text: ConsumerControlCode.BRIGHTNESS_DECREMENT,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Decrease Brightness'
            },
            {
                text: ConsumerControlCode.BRIGHTNESS_INCREMENT,
                type: CommandType.CONSUMER_CONTROL,
                name: 'Increase Brightness'
            },
            {
                text: '',
                type: CommandType.TEXT,
                name: 'Type Text'
            },
            {
                text: 0.25,
                type: CommandType.WAIT,
                name: 'Wait'
            },
            {
                text: '',
                type: CommandType.RPC,
                name: 'Remote Procedure Call'
            },
            {
                text: MouseButton.LEFT_BUTTON,
                type: CommandType.MOUSE_BUTTON,
                name: 'Hold Left Mouse Button'
            },
            {
                text: MouseButton.RIGHT_BUTTON,
                type: CommandType.MOUSE_BUTTON,
                name: 'Hold Right Mouse Button'
            },
            {
                text: MouseButton.MIDDLE_BUTTON,
                type: CommandType.MOUSE_BUTTON,
                name: 'Hold Middle Mouse Button'
            },
            {
                text: CommandService.release(MouseButton.LEFT_BUTTON),
                type: CommandType.MOUSE_BUTTON,
                name: 'Release Left Mouse Button'
            },
            {
                text: CommandService.release(MouseButton.RIGHT_BUTTON),
                type: CommandType.MOUSE_BUTTON,
                name: 'Release Right Mouse Button'
            },
            {
                text: CommandService.release(MouseButton.MIDDLE_BUTTON),
                type: CommandType.MOUSE_BUTTON,
                name: 'Release Middle Mouse Button'
            },
            {
                text: 0,
                type: CommandType.MOUSE_WHEEL,
                name: 'Scroll Mouse Wheel'
            },
            {
                text: 0,
                type: CommandType.MOUSE_X,
                name: 'Move Mouse X'
            },
            {
                text: 0,
                type: CommandType.MOUSE_Y,
                name: 'Move Mouse Y'
            },
            {
                text: 262,
                type: CommandType.TONE,
                name: 'Play Tone'
            },
            {
                text: 0,
                type: CommandType.TONE_STOP,
                name: 'Stop Tone'
            }
        ] as Array<Command>
    }
}
