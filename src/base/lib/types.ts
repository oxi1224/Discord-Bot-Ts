import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { User, Role, NonThreadGuildBasedChannel, Snowflake, CommandInteractionOption } from "discord.js";
import { DurationString } from "./constants.js";
import { EventEmitter } from 'events';

export type ClassConstructor<constructable> = {
  new (): constructable,
}

export type CustomClientOptions = {
  owners: Snowflake[],
}

export type CommandHandlerOptions = {
  commandExportFile: string,
  prefix: string,
  flagRegex?: RegExp,
  aliasReplacement?: RegExp
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
  defaultInterval: number,
}

export type TaskOptions = {
  interval?: number
}

export type ListenerHandlerOptions = {
  listenerExportFile: string
}

export type ListenerOptions = {
  emitter: EventEmitter,
  event: string
}