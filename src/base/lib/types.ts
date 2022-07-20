import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { User, Role, NonThreadGuildBasedChannel, UserResolvable, CommandInteractionOption } from "discord.js";
import { Command } from '../command/Command.js';
import { DurationString } from "./constants.js";
import { Task } from "../task/Task.js";

export type CustomClientOptions = {
  owners: UserResolvable[],
  specialUsers: UserResolvable[]
}

export type CommandHandlerOptions = {
  commandExportFile: string,
  prefix: string,
  flagRegex?: RegExp,
  aliasReplacement?: RegExp
}

export type CommandConstructor = {
  new (): Command,
}

export type CommandOptions = {
  aliases: string[],
  args: CommandArgument[],
  userPermissions?: bigint,
  description: string
  slash?: boolean,
}

export type CommandArgument = {
  id: string,
  type: CommandArgumentType,
  optional?: boolean,
  slashType?: ApplicationCommandOptionType,
  description?: string,
  length?: number,
}

export type CommandArgumentType = 'duration' | 'string' | 'user' | 'channel' | 'role' | 'boolean' | 'integer' | 'number' | 'flag'
export type Duration = `${number}${keyof typeof DurationString}`
export type ParsedArgs = { [key: string]: string | boolean | number | User | NonThreadGuildBasedChannel | Role | Duration | null | undefined | CommandInteractionOption }

export type TaskHandlerOptions = {
  taskExportFile: string,
  defaultCooldown: number,
}

export type TaskConstructor = {
  new (): Task
}

export type TaskOptions = {
  autoStart?: boolean,
  delay?: number
}