import { Command, type Duration } from '#base';
import { Message, CommandInteraction, User } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export default class WarnCommand extends Command {
  constructor() {
    super('warn', {
      aliases: ['warn'],
      args: [
        {
          id: 'user',
          type: 'user',
          optional: false,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to warn'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The user to warn'
        },
        {
          id: 'flag',
          type: 'flag',
          slashType: ApplicationCommandOptionType.Boolean,
          description: 'test flag'
        }
      ],
      description: 'Warns a member'
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