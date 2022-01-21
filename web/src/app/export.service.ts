import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { Config } from './interfaces/config';
import { CommandType } from './enums/command-type';
import { Macro } from './interfaces/macro';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() { }

    static export(apps: Config[]) {
        const zip = new JSZip();

        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];
            zip.file((i + 1) + app.name + '.py', ExportService.getContent(app));
        }

        zip.generateAsync({ type: 'blob' }).then(function (content) {
            FileSaver.saveAs(content, 'macropad-configurations.zip');
        });

    }

    private static getContent(app: Config): string {

        let lines = [];

        lines.push('from adafruit_hid.keycode import Keycode');
        lines.push('from adafruit_hid.consumer_control_code import ConsumerControlCode');
        lines.push('from adafruit_hid.mouse import Mouse');
        lines.push('');
        lines.push('app = {');
        lines.push('    \'name\' : \'' + app.name + '\',');
        lines.push('    \'macros\' : [');

        for (let i = 0; i < app.macros.length; i++) {
            let line = '        ' + ExportService.getMacroContent(app.macros[i]);
            if (i + 1 < app.macros.length) {
                line += ',';
            }
            lines.push(line);
        }

        lines.push('    ]');
        lines.push('}');

        return lines.join('\n');
    }

    static getMacroContent(macro?: Macro): string {
        if (!macro) {
            return '';
        }

        let commands = [];

        for (const command of macro.commands) {

            switch (command.type) {
                case CommandType.TEXT:
                    commands.push('\'' + command.text + '\'');
                    break;
                case CommandType.CONSUMER_CONTROL:
                    commands.push('[' + command.text + ']');
                    break;
                case CommandType.MOUSE_BUTTON:
                    commands.push('{\'buttons\':' + command.text + '}');
                    break;
                case CommandType.MOUSE_WHEEL:
                    commands.push('{\'wheel\':' + command.text + '}');
                    break;
                case CommandType.MOUSE_X:
                    commands.push('{\'x\':' + command.text + '}');
                    break;
                case CommandType.MOUSE_Y:
                    commands.push('{\'y\':' + command.text + '}');
                    break;
                case CommandType.TONE:
                case CommandType.TONE_STOP:
                    commands.push('{\'tone\':' + command.text + '}');
                    break;
                case CommandType.RPC:
                    commands.push('{\'rpc\':\'' + command.text + '\'}');
                    break;
                case CommandType.FAVORITE:
                    commands.push(command.text);
                    break;
                default:
                    if (typeof command.text === 'string' && command.text.indexOf('Keycode.') === -1 && command.text.indexOf('-Keycode.') === -1) {
                        commands.push('\'' + command.text + '\'');
                    } else {
                        commands.push(command.text);
                    }
                    break;
            }
        }

        return '(' + macro.color.replace('#', '0x') + ', \'' + macro.name + '\', [' + commands.join(', ') + '])';
    }
}
