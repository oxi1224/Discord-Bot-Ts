import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command } from "./Command.js";
import type { CommandArgument, CommandArgumentType } from "../lib/types.js";

/**
 * Represents a command argument
 */
export class Argument {

  /**
   * The command this argument belongs to.
   */
  public command: Command;

  /**
   * The id of this argument.
   */
  public id: string;

  /**
   * The type of this argument (used for prefixed commands).
   */
  public type: CommandArgumentType;

  /**
   * Whether or not this argument is optional.
   */
  public optional?: boolean;

  /**
   * The type of this argument (if command has slash set to true).
   */
  public slashType?: ApplicationCommandOptionType;

  /**
   * The description of this argument.
   */
  public description?: string;

  /**
   * The index of this argument in the command's argument array.
   */
  public index: number;

  /**
   * The length of this argument, applies only to type string.
   */
  public length: number;

  /**
   * @param command - The command this argument belongs to.
   * @param options - Options.
   */
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
