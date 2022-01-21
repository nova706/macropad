import { Command } from "./command";

export interface Macro {
    name: string;
    color: string;
    commands: Array<Command>;
}
