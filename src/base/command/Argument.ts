import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command } from "./Command.js";
import type { CommandArgument, CommandArgumentType } from "../lib/types.js";

export class Argument {
  public command: Command;
  public id: string;
  public type: CommandArgumentType;
  public optional?: boolean;
  public slashType?: ApplicationCommandOptionType;
  public description?: string;
  public index: number;
  public length: number;

  constructor(command: Command, {
    id,
    type,
    optional = true,
    slashType,
    description = '',
    length = Infinity,
  }: CommandArgument) {
    this.command = command;
    this.id = id;
    this.type = type;
    this.optional = optional;
    this.slashType = slashType;
    this.description = description;
    this.index = command.args.findIndex(arg => arg.id === this.id);
    this.length = length;

  }

  set indexSetter(value: number) {
    this.index = value;
  }

  set typeSetter(type: CommandArgumentType) {
    this.type = type;
  }
}
