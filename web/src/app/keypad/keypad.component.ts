import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Macro } from '../interfaces/macro';

@Component({
    selector: 'app-keypad',
    templateUrl: './keypad.component.html',
    styleUrls: ['./keypad.component.css']
})
export class KeypadComponent implements OnInit {

    @Input() macros!: Array<Macro>;
    @Output() selectionChange = new EventEmitter<number | undefined>();

    selectedMacro: number | undefined;

    constructor() { }

    ngOnInit(): void {
    }

    selectKey(index: number) {
        if (this.selectedMacro === index) {
            this.selectedMacro = undefined;
        } else {
            this.selectedMacro = index
        }
        this.selectionChange.emit(this.selectedMacro);
    }
}
