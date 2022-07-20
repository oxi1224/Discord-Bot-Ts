import { SlashCommandBuilder } from 'discord.js';
import { CommandArgument } from './types.js';

export enum TimeInMs {
  Milisecond = 1,
  Second = Milisecond * 1000,
  Minute = Second * 60,
  Hour = Minute * 60,
  Day = Hour * 24,
  Week = Day * 7,
  Month = Day * 31
}

export enum DurationString {
  min = 'Minute',
  minute = 'Minute',
  minutes = 'Minute',
  h = 'Hour',
  hour = 'Hour',
  hours = 'Hour',
  d = 'Day',
  day = 'Day',
  days = 'Day',
  w = 'Week',
  week = 'Week',
  weeks = 'Week',
  m = 'Month',
  month = 'Month',
  months = 'Month'
}

export const regex = {
  user: /<@\d{6,18}>/,
  channel: /<#\d{6,18}>/,
  role: /<@!\d{6,18}>/,
  snowflake: /<[\\@#&!]+\d{6,18}>/,
  duration: /^\d+(min|minute|minutes|h|hour|hours|d|day|days|w|week|weeks|m|month|months)$/i,
};

export const slashOptions = {
  '3': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addStringOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '4': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addIntegerOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '5': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addBooleanOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '6': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addUserOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '7': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addChannelOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '8': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addRoleOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
  '10': (slashCommand: SlashCommandBuilder, arg: CommandArgument) => slashCommand.addNumberOption(option => option.setName(arg.id)
    .setDescription(arg.description ?? '')
    .setRequired(!arg.optional)),
};