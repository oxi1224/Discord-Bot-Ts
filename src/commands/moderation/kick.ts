import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, logError, colors } from '#lib';

export default class KickCommand extends Command {
  constructor() {
    super('kick', {
      aliases: ['kick'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to kick'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the kick'
        }
      ],
      description: 'Kicks a member',
      usage: 'kick <member> [reason]',
      examples: ['kick @oxi#6219 spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.KickMembers,
      clientPermissions: [PermissionFlagsBits.KickMembers]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    reason: string,
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    if (!victim) return message.reply(embeds.error(`${args.user} is not in the guild`));
    if (victim?.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.user} is a staff member`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been kicked in ${message.guild}`)
      .setDescription(`Reason: \`\`${args.reason ?? 'None'}\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'kick',
      reason: args.reason,
    };
    let modlogEntry;

    try {
      modlogEntry = await createModlogsEntry(message.guild, options);
    } catch (e) {
      await logError(e as Error);
      return message.reply(embeds.error('An error occured while creating the modlog entry. Please contact oxi#6219'));
    }

    const dmMessage = await args.user.send({ embeds: [embed] }).catch(() => null);

    try {
      await message.guild.members.kick(args.user.id, args.reason);
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      return await message.reply(embeds.success(`${args.user} has been successfully kicked`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await logError(e as Error);
      return message.reply(embeds.error('An error has occured while kicking the user'));
    }
  }
}