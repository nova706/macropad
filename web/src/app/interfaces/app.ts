import { Macro } from "./macro";

export interface App {
    name: string;
    id?: string;
    order?: number;
    macros: Macro[];
}
