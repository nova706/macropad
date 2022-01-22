import { Component, OnInit } from '@angular/core';
import { CommandService } from './command.service';
import { Keycode } from './enums/keycode';
import { Command } from './interfaces/command';
import { CommandType } from './enums/command-type';
import { Macro } from './interfaces/macro';
import { ExportService } from './export.service';
import { ApiService } from './api.service';
import { App } from './interfaces/app';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    title = 'macropad';
    currentIndex = 0;

    exampleApp: App = {

        // REQUIRED dict, must be named 'app'
        // MACROPAD Hotkeys example: Safari web browser for Mac
        name: 'Mac Safari', // Application name
        order: 0,
        macros: [           // List of button macros...

            // First Row
            {
                name: '< Back',
                color: '#004000',
                commands: this.build([Keycode.COMMAND, Keycode.LEFT_BRACKET])
            },
            {
                name: 'Fwd >',
                color: '#004000',
                commands: this.build([Keycode.COMMAND, Keycode.RIGHT_BRACKET])
            },
            {
                name: 'Up',
                color: '#400000',
                commands: this.build([Keycode.SHIFT, Keycode.SPACE])
            },

            // Second Row
            {
                name: '< Tab',
                color: '#202000',
                commands: this.build([Keycode.CONTROL, Keycode.SHIFT, Keycode.TAB])
            },
            {
                name: 'Tab >',
                color: '#202000',
                commands: this.build([Keycode.CONTROL, Keycode.TAB])
            },
            {
                name: 'Down',
                color: '#400000',
                commands: this.build([Keycode.SPACE])
            },

            // Third Row
            {
                name: 'Reload',
                color: '#000040',
                commands: this.build([Keycode.COMMAND, 'r'])
            },
            {
                name: 'Home',
                color: '#000040',
                commands: this.build([Keycode.COMMAND, 'h'])
            },
            {
                name: 'Private',
                color: '#000040',
                commands: this.build([Keycode.COMMAND, 'n'])
            },

            // Fourth Row
            {
                name: 'Ada',
                color: '#000000',
                commands: this.build([Keycode.COMMAND, 'n', CommandService.release(Keycode.COMMAND), 'www.adafruit.com', Keycode.ENTER])
            },
            {
                name: 'Digi',
                color: '#800000',
                commands: this.build([Keycode.COMMAND, 'n', CommandService.release(Keycode.COMMAND), 'www.digikey.com', Keycode.ENTER])
            },
            {
                name: 'Hacks',
                color: '#101010',
                commands: this.build([Keycode.COMMAND, 'n', CommandService.release(Keycode.COMMAND), 'www.hackaday.com', 0.25, Keycode.ENTER])
            }
        ]
    }

    apps: App[] = [];
    favorites: Command[] = [];

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.load();
    }

    newConfig() {
        this.apps.push({
            name: '',
            order: this.apps.length,
            macros: Array.from({ length: 12 }, () => ({
                name: '',
                color: '#000000',
                commands: []
            }))
        });
        this.currentIndex = this.apps.length - 1;
        this.save();
    }

    removeConfig() {
        this.apps.splice(this.currentIndex, 1);
        this.currentIndex = Math.max(0, Math.min(this.currentIndex - 1, this.apps.length - 1));
        if (this.apps.length === 0) {
            this.newConfig();
        }
        this.save();
    }

    addFavorite(macro: Macro) {
        this.favorites.push({
            name: macro.name,
            type: CommandType.FAVORITE,
            text: ExportService.getMacroContent(macro)
        });
        this.save();
    }

    removeFavorite(command: Command) {
        // TODO: Confirm
        this.favorites.splice(this.favorites.indexOf(command), 1);
        this.save();
    }

    export() {
        ExportService.export(this.apps);
    }

    save() {
        this.apiService.saveMacros(this.apps).subscribe(macros => {
            this.apps = macros;
        });

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    private load() {
        const favorites = localStorage.getItem('favorites');
        this.favorites = favorites ? JSON.parse(favorites) : [];

        this.apiService.getMacros().subscribe(macros => {
            this.apps = macros;

            if (this.apps.length === 0) {
                this.apps.push(this.exampleApp);
            }
        });
    }

    private build(textArray: Array<string | number>): Array<Command> {
        const commands: Array<Command> = [];

        for (let text of textArray) {
            const command = this.findCommand(text);
            if (command) {
                commands.push(command);
            }
        }

        return commands;
    }

    private findCommand(text: string | number): Command | undefined {
        const commands = CommandService.getCommands();
        let command = commands.find((com) => com.text === text);

        if (!command) {
            if (typeof text === 'string') {
                command = commands.find((com) => com.type === CommandType.TEXT);
            } else {
                command = commands.find((com) => com.type === CommandType.WAIT);
            }
            if (command) {
                command.text = text;
            }
        }

        return command;
    }

}
