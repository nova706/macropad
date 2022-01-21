import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Macro } from '../interfaces/macro';

@Component({
    selector: 'app-key',
    templateUrl: './key.component.html',
    styleUrls: ['./key.component.css']
})
export class KeyComponent implements OnInit {

    @Input() macro!: Macro;
    @HostBinding('style.box-shadow') get boxShadow() {
        return '0 0 10px 2px ' + this.macro.color;
    };

    constructor() { }

    ngOnInit(): void {
    }

}
