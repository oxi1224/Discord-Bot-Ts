import { Message, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, validConfigKeys, setSetting, GuildConfigModel, embeds, logError } from '#lib';
import { regex } from '#base';

export default class SetCommand extends Command {
  constructor() {
    super('set', {
      aliases: ['set'],
      args: [
        {
          id: 'key',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The key to set.',
          length: 1,
          required: true,
          options: [
            { name: 'mutedRole', value: 'mutedrole' },
            { name: 'prefix', value: 'prefix' },
            { name: 'modlogsChannel', value: 'modlogschannel' },
            { name: 'actionsChannel', value: 'actionschannel' },
            { name: 'commandChannels', value: 'commandchannels' },
            { name: 'automodImmune', value: 'automodimmune' },
            { name: 'lockdownChannels', value: 'lockdownchannels' },
          ]
        },
        {
          id: 'value',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: `The value the key will be set to.`,
          length: 1,
          required: true,
        }
      ],
      description: 'Sets a config value.',
      extraInfo: `» **Valid keys**: ${validConfigKeys.join(', ')}.
» **To remove values from keys**: commandChannels, automodImmune and lockdownChannels just set them again.
» **Every value instead of prefix is a discord snowflake (ID).**`,
      usage: 'set <key>',
      examples: ['set prefix -'],
      category: 'Config',
      userPermissions: PermissionFlagsBits.Administrator
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    key: keyof GuildConfigModel,
    value: string
  }) {
    if (!message.guild?.available) return;
    if (!args.key || !(validConfigKeys.includes(args.key))) return message.reply(embeds.error('Invalid key argument'));
    if (!args.value || (args.key !== 'prefix' && !(args.value.match(regex.snowflake)))) return message.reply(embeds.error('Invalid key argument.'));

    try {
      await setSetting(message.guild.id, args.key, args.value);
      message.reply(embeds.success('Successfully changed the config.'));
    } catch (e) {
      message.reply(embeds.error('There was an error while changing the config. Please contact oxi#6219.'));
      logError(e as Error);
    }
    return;
  }
}