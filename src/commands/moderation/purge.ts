import { Message, User, GuildMember, EmbedBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, logError, colors, getSetting } from '#lib';

export default class PurgeCommand extends Command {
  constructor() {
    super('purge', {
      aliases: ['purge', 'clear'],
      args: [
        {
          id: 'count',
          type: 'integer',
          required: true,
          slashType: ApplicationCommandOptionType.Integer,
          description: 'The range of messsages to purge (min: 1, max: 100)'
        },
        {
          id: 'user',
          type: 'user',
          slashType: ApplicationCommandOptionType.User,
          description: 'The user whose messages to purge'
        }
      ],
      description: 'Purges messages in current channel',
      usage: 'purge <reason> [user]',
      examples: ['purge 100', 'purge 20 @oxi#6219'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.ManageMessages,
      clientPermissions: [PermissionFlagsBits.ManageMessages]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    count: number,
    user: User,
  }) {
    if (!message.guild?.available) return;
    if (!message.channel?.messages) return;
    if (!args.count || args.count < 1 || args.count > 100) return message.reply(embeds.error('Invalid count, must be between 1 and 100'));
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const channelId = (await getSetting(message.guild.id, 'loggingChannels')).modlogsChannel;
    const channel = channelId ? await message.guild.channels.fetch(channelId).catch(() => null) : null;
    const embed = new EmbedBuilder()
      .setTitle(`Action: purge`)
      .setColor(colors.base)
      .setAuthor({ name: `${author.user.username}#${author.user.discriminator}`, iconURL: author.displayAvatarURL() })
      .setThumbnail(author.displayAvatarURL())
      .setTimestamp()
      .setFields([
        { name: 'Moderator', value: `${author}`, inline: true },
        { name: 'Channel', value: `${message.channel}`, inline: true },
        { name: 'Message Count', value: args.count.toString(), inline: true },
        { name: 'User', value: `${args.user ?? 'None'}`, inline: true },
      ]);
    let messages = (await message.channel.messages
      .fetch({ limit: args.count, before: message.id }));
    if (args.user) messages = messages.filter(msg => msg.author.id === args.user.id);
    if (messages.size === 0 && args.user) return message.reply(embeds.error(`No messages found from ${args.user} in specified range`));

    try {
      await (message.channel as TextChannel).bulkDelete(messages);
      if (channel) (channel as TextChannel).send({ embeds: [embed] });
      await message.reply(embeds.success(`Succesfully purged ${messages.size} messages${args.user ? ` from ${args.user}` : ''}`));    
    } catch (e) {
      await logError(e as Error);
      message.reply(embeds.error('An error has occured while deleteing the messages.'));
    }
    return;
  }
}