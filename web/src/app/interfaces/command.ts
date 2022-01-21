import { CommandType } from "../enums/command-type";

export interface Command {
    text: string | number;
    type: CommandType;
    name: string;
}
