import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { CommandType } from '../enums/command-type';
import { Command } from '../interfaces/command';

@Component({
    selector: 'app-command',
    templateUrl: './command.component.html',
    styleUrls: ['./command.component.css']
})
export class CommandComponent implements OnInit {

    @Input() command!: Command;
    @Output() remove = new EventEmitter<any>();
    @Output() changed = new EventEmitter<any>();

    @HostBinding('class') get className() {
        return this.command.type;
    }

    CommandType = CommandType;

    constructor() { }

    ngOnInit(): void {
    }

}
