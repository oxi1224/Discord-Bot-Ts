import { Message, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, validConfigKeys, setSetting, embeds, logError, guildConfigKeysMap, GuildConfigModelKey, getSetting, GuildConfigModel } from '#lib';
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
            { name: 'remove', value: 'remove' },
            { name: 'clear', value: 'clear' }
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
      extraInfo: `» **Valid methods**: set, add, remove, clear.
» **Valid keys**: ${validConfigKeys.join(', ')}`,
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
    if (!['set', 'add', 'remove', 'clear'].includes(args.method)) return message.reply(embeds.error('Invalid method (must be set, add or clear)'));
    const key = guildConfigKeysMap.get(args.key) as GuildConfigModelKey;
    if (!key) return message.reply(embeds.error('Invalid key'));
    if (!args.value && args.method !== 'clear') return message.reply(embeds.error('Invalid value'));

    const id = args.value?.replace(/[\\<>@#&!]/g, '');
    try {
      switch (args.method) {
      case 'set':
        switch (key) {
        case 'starboardChannel':
        case 'actionsChannel':
        case 'modlogsChannel':
        case 'suggestionsChannel':
          const channel = await message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          if (!channel.isTextBased()) return message.reply(embeds.error('Channel must be text based.'));
          await setSetting(message.guild.id, key, id);
          break;
        case 'mutedRole':
          const role = await message.guild.roles.fetch(id).catch(() => null);
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
        case 'lockdownChannels':
          const channel = await message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          if (!channel.isTextBased()) return message.reply(embeds.error('Channel must be text based.'));
          const channelArr = await getSetting(message.guild.id, key);
          if (channelArr.some(str => str === id)) return message.reply(embeds.error(`${id} already is in ${key}`));
          channelArr.push(id);
          await setSetting(message.guild.id, key, channelArr);
          break;
        case 'automodImmune':
          const user = await message.guild.members.fetch(id).catch(() => null);
          if (!user) return message.reply(embeds.error('Invalid user'));
          const userArr = await getSetting(message.guild.id, key);
          if (userArr.some(str => str === id)) return message.reply(embeds.error(`${id} already is in ${key}`));
          userArr.push(id);
          await setSetting(message.guild.id, key, userArr);
          break;
        default:
          return message.reply(embeds.error('This key cannot be used with add'));
        }
        break;
      case 'remove':
        switch (key) {
        case 'commandChannels':
        case 'lockdownChannels':
          const channel = await message.guild.channels.fetch(id).catch(() => null);
          if (!channel) return message.reply(embeds.error('Invalid channel'));
          if (!channel.isTextBased()) return message.reply(embeds.error('Channel must be text based.'));
          const channelArr = await getSetting(message.guild.id, key);
          if (!channelArr.some(str => str === id)) return message.reply(embeds.error(`${id} is not in ${key}`));
          await setSetting(message.guild.id, key, channelArr.filter(str => str === id));
          break;
        case 'automodImmune':
          const user = await message.guild.members.fetch(id).catch(() => null);
          if (!user) return message.reply(embeds.error('Invalid user'));
          const userArr = await getSetting(message.guild.id, key);
          if (!userArr.some(str => str === id)) return message.reply(embeds.error(`${id} is not in ${key}`));
          await setSetting(message.guild.id, key, userArr.filter(str => str === id));
          break;
        default:
          return message.reply(embeds.error('This key cannot be used with remove'));
        }
        break;
      case 'clear':
        const prevVal = await getSetting(message.guild.id, key as keyof GuildConfigModel);
        await setSetting(message.guild.id, key as keyof GuildConfigModel, Array.isArray(prevVal) ? [] : '');
        break;
      }
      message.reply(embeds.success(`Succesfully ${args.method === 'remove' ? `removed ${args.value} from` :
        args.method === 'add' ? `added ${args.value} to` : args.method === 'clear' ? 'cleared' : 
          'set'} ${key} ${args.method === 'set' ? `to ${args.value}` : ''}`)
      );
    } catch (e) {
      message.reply(embeds.error('Something went from while changin the config.'));
      logError(e as Error);
    }
    return;
  }
}