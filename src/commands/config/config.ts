import { Message, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, validConfigKeys, setSetting, embeds, logError, guildConfigKeysMap, GuildConfigModelKey, getSetting } from '#lib';
import { InteractionChoice } from '#base';

export default class ConfigCommand extends Command {
  constructor() {
    super('config', {
      aliases: ['config'],
      args: [
        {
          id: 'method',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The method to use while modifying the config.',
          length: 1,
          required: true,
          options: [
            { name: 'set', value: 'set' },
            { name: 'add', value: 'add' },
            { name: 'remove', value: 'remove' }
          ]
        },
        {
          id: 'key',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The key to set.',
          length: 1,
          required: true,
          options: (() => {
            const arr: InteractionChoice[] = [];
            validConfigKeys.forEach(str => arr.push({ name: str, value: str.toLowerCase() }));
            return arr;
          })()
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
      description: 'Changes a config value.',
      extraInfo: `» **Valid methods**: set, add, remove.
» **Valid keys**: ${validConfigKeys.join(', ')}
» **Every value instead of prefix is a discord snowflake (ID).**`,
      usage: 'config <method> <key> <value>',
      examples: ['config set prefix -'],
      category: 'Config',
      userPermissions: PermissionFlagsBits.Administrator
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    method: string,
    key: GuildConfigModelKey,
    value: string
  }) {
    if (!message.guild?.available) return;
    if (!['set', 'add', 'remove'].includes(args.method)) return message.reply(embeds.error('Invalid method (must be set, add or remove)'));
    const key = guildConfigKeysMap.get(args.key) as GuildConfigModelKey;
    if (!key) return message.reply(embeds.error('Invalid key'));
    if (!args.value) return message.reply(embeds.error('Invalid value'));

    const id = args.value.replace(/[\\<>@#&!]/g, '');
    try {
      switch (args.method) {
      case 'set':
        switch (key) {
        case 'actionsChannel':
        case 'modlogsChannel':
          const channel = message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          const val = await getSetting(message.guild.id, 'loggingChannels');
          val[key] = id;
          await setSetting(message.guild.id, 'loggingChannels', val);
          break;
        case 'mutedRole':
          const role = message.guild.roles.fetch(id).catch(() => null);
          if (!role) return message.reply(embeds.error('Invalid role'));
          await setSetting(message.guild.id, key, id);
          break;
        case 'prefix':
          await setSetting(message.guild.id, key, args.value);
          break;
        default:
          return message.reply(embeds.error('This key cannot be used with set'));
        }
        break;
      case 'add':
        switch (key) {
        case 'commandChannels':
        case 'automodImmune':
        case 'lockdownChannels':
          const channel = message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          const arr = await getSetting(message.guild.id, key);
          if (arr.some(str => str === id)) return message.reply(embeds.error(`${id} already is in ${key}`));
          arr.push(id);
          await setSetting(message.guild.id, key, arr);
          break;
        default:
          return message.reply(embeds.error('This key cannot be used with add'));
        }
        break;
      case 'remove':
        switch (key) {
        case 'commandChannels':
        case 'automodImmune':
        case 'lockdownChannels':
          const channel = message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          const arr = await getSetting(message.guild.id, key);
          if (!arr.some(str => str === id)) return message.reply(embeds.error(`${id} is not in ${key}`));
          await setSetting(message.guild.id, key, arr.filter(str => str === id));
          break;
        default:
          return message.reply(embeds.error('This key cannot be used with remove'));
        }
        break;
      }
      message.reply(embeds.success(`Succesfully ${args.method === 'remove' ? `removed ${args.value} from` :
        args.method === 'add' ? `added ${args.value} to` : 'set'} ${key} ${args.method === 'set' ? `to ${args.value}` : ''}`));
    } catch (e) {
      message.reply(embeds.error('Something went from while changin the config.'));
      logError(e as Error);
    }
    return;
  }
}