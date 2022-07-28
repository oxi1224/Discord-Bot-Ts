import { type Duration } from '#base';
import { Message, CommandInteraction, User } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command } from '#lib';

export default class WarnCommand extends Command {
  constructor() {
    super('warn', {
      aliases: ['warn'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to warn'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The user to warn'
        }
      ],
      description: 'Warns a member',
      usage: 'warn <member> <reason>',
      examples: ['warn @oxi#6219 spamming'],
      category: 'Moderation',
    });
  }

  public override execute(message: Message | CommandInteraction, args: {
    user: User,
    duration: Duration,
    reason: string,
    flag: string
  }) {
    console.log(args);
  }
}