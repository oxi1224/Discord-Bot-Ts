import { Message, User, GuildMember, EmbedBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, logError, colors, Modlogs, getSetting } from '#lib';
import { Op } from "sequelize";

export default class HidePunishmentCommand extends Command {
  constructor() {
    super('hidepunishment', {
      aliases: ['hide-punishment', 'hide-modlog', 'del-warn'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user whose modlog to hide'
        },
        {
          id: 'id',
          type: 'string',
          required: true,
          length: 1,
          slashType: ApplicationCommandOptionType.String,
          description: 'The id of the modlog'
        }
      ],
      description: 'Hides a modlog entry of a user',
      usage: 'hide-punishment <punshment ID> <user>',
      examples: ['hide-punishment @oxi#6219 dQw4w9WgXcQ'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.Administrator,
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    id: string,
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const channelId = (await getSetting(message.guild.id, 'loggingChannels')).modlogsChannel;
    const channel = channelId ? await message.guild.channels.fetch(channelId).catch(() => null) : null;
    let modlog;
    try {
      modlog = await Modlogs.findOne({
        where: {
          [Op.and]: [
            { guildId: message.guild.id },
            { victimId: args.user.id },
            { id: args.id }
          ]          
        },
      });
    } catch (e) {
      await message.reply('There was an error while fetching the modlog. Pleae contact oxi#6219');
      await logError(e as Error);
    }
    if (!modlog) return message.reply(embeds.info('No modlog with such ID found'));

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle('Action: modlogHide')
      .setAuthor({ name: `${author.user.username}#${author.user.discriminator}` })
      .setThumbnail(author.displayAvatarURL())
      .setFields([
        { name: 'Moderator', value: `${author}`, inline: true },
        { name: 'Member', value: `${args.user}`, inline: true },
        { name: 'Case ID', value: args.id, inline: true },
      ]);
      
    try {
      modlog.destroy();
      message.reply(embeds.success(`Successfully deleted ${args.user} modlog with ID ${args.id}`));
      if (channel) (channel as TextChannel).send({ embeds: [embed] });
    } catch (e) {
      message.reply(embeds.error('Something went wrong while removing the entry. Please contant oxi#6219'));
    }
    return;
  }
}