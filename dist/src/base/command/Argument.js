import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command } from "./Command.js";
export class Argument {
    command;
    id;
    type;
    optional;
    slashType;
    description;
    index;
    length;
    constructor(command, { id, type, optional = true, slashType, description = '', length = Infinity, }) {
        this.command = command;
        this.id = id;
        this.type = type;
        this.optional = optional;
        this.slashType = slashType;
        this.description = description;
        this.index = command.args.findIndex(arg => arg.id === this.id);
        this.length = length;
    }
    set indexSetter(value) {
        this.index = value;
    }
    set typeSetter(type) {
        this.type = type;
    }
}
//# sourceMappingURL=Argument.js.map