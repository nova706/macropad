import { CdkDragDrop, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommandService } from '../command.service';
import { CommandType } from '../enums/command-type';
import { App } from '../interfaces/app';
import { Command } from '../interfaces/command';
import { Macro } from '../interfaces/macro';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

    @Input() config!: App;
    @Input() favorites!: Command[];
    @Input() hasPrevious: boolean = false;
    @Input() hasNext: boolean = false;

    @Output() previous = new EventEmitter<any>();
    @Output() next = new EventEmitter<any>();
    @Output() new = new EventEmitter<any>();
    @Output() remove = new EventEmitter<any>();
    @Output() addFavorite = new EventEmitter<Macro>();
    @Output() removeFavorite = new EventEmitter<Command>();
    @Output() changed = new EventEmitter<any>();

    selectedMacro: number = -1;

    section = 0;

    commands: Command[] = [];
    allCommands: Command[] = CommandService.getCommands();
    modifiers: Command[] = [];
    keys: Command[] = [];
    consumerControls: Command[] = [];
    mouseControls: Command[] = [];
    otherControls: Command[] = [];

    constructor() { }

    ngOnInit(): void {
        this.modifiers = this.allCommands.filter(command => command.type === CommandType.MODIFIER_ON || command.type === CommandType.MODIFIER_OFF);
        this.keys = this.allCommands.filter(command => command.type === CommandType.KEYPRESS);
        this.consumerControls = this.allCommands.filter(command => command.type === CommandType.CONSUMER_CONTROL);
        this.mouseControls = this.allCommands.filter(command => command.type === CommandType.MOUSE_BUTTON || command.type === CommandType.MOUSE_WHEEL || command.type === CommandType.MOUSE_X || command.type === CommandType.MOUSE_Y);
        this.otherControls = this.allCommands.filter(command => command.type === CommandType.TEXT || command.type === CommandType.WAIT || command.type === CommandType.TONE || command.type === CommandType.TONE_STOP || command.type === CommandType.RPC);
    }

    selectMacro(index: number | undefined) {
        this.selectedMacro = index === undefined ? -1 : index;
        this.commands = this.config.macros[this.selectedMacro] ? this.config.macros[this.selectedMacro].commands : [];
    }

    drop(event: CdkDragDrop<Command[] | any>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            copyArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
            event.container.data[event.currentIndex] = this.cloneCommand(event.container.data[event.currentIndex]);
        }
        this.changed.emit();
    }

    noReturnPredicate() {
        return false;
    }

    removeCommand(command: Command) {
        this.config.macros[this.selectedMacro]?.commands.splice(this.config.macros[this.selectedMacro].commands.indexOf(command), 1);
        this.changed.emit();
    }

    private cloneCommand(command: Command) {
        return Object.assign({}, command);
    }
}
