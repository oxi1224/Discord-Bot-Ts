import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, logError, colors } from '#lib';

export default class UnBan extends Command {
  constructor() {
    super('unban', {
      aliases: ['unban'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to unban'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the unban'
        }
      ],
      description: 'Bans a member',
      usage: 'unban <member> [duration] [reason]',
      examples: ['unban @oxi#6219 spamming', 'unban @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.BanMembers,
      clientPermissions: [PermissionFlagsBits.BanMembers]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    reason: string,
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));

    const member = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);

    const banList = await message.guild.bans.fetch();
    if (!banList?.has(args.user.id)) return message.reply(embeds.error(`${args.user} is not banned`));
    if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.user} is a staff member`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been unbanned in ${message.guild}`)
      .setDescription(`Reason: \`\`\`${args.reason ?? 'None'}\`\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'unban',
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
      await message.guild.bans.remove(args.user, args.reason ?? 'None');
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      return await message.reply(embeds.success(`${args.user} has been successfully unbanned`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await logError(e as Error);
      return message.reply(embeds.error('An error has occured while unbanning the user'));
    }
  }
}