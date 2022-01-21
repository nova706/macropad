import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Macro } from '../interfaces/macro';

@Component({
    selector: 'app-keypad',
    templateUrl: './keypad.component.html',
    styleUrls: ['./keypad.component.css']
})
export class KeypadComponent implements OnInit {

    @Input() macros!: Array<Macro>;
    @Output() selectionChange = new EventEmitter<Macro | undefined>();

    selectedMacro: Macro | undefined;

    constructor() { }

    ngOnInit(): void {
    }

    selectKey(macro: Macro) {
        if (this.selectedMacro === macro) {
            this.selectedMacro = undefined;
        } else {
            this.selectedMacro = macro
        }
        this.selectionChange.emit(this.selectedMacro);
    }
}
