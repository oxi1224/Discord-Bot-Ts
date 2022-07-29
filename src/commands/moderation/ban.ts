import { ParsedDuration } from '#base';
import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, createExpiringPunishmentsEntry, logError, colors } from '#lib';

export default class BanCommand extends Command {
  constructor() {
    super('ban', {
      aliases: ['ban'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to ban'
        },
        {
          id: 'duration',
          type: 'duration',
          slashType: ApplicationCommandOptionType.String,
          description: 'The duration of the ban'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the ban'
        }
      ],
      description: 'Bans a member',
      usage: 'ban <member> [duration] [reason]',
      examples: ['ban @oxi#6219 spamming', 'ban @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.BanMembers,
      clientPermissions: [PermissionFlagsBits.BanMembers]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    duration: ParsedDuration,
    reason: string,
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const banList = await message.guild.bans.fetch();
    if (banList?.has(args.user.id)) return message.reply(embeds.error(`${args.user} is already banned`));
    if (victim?.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.user} is a staff member`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been banned ${!args.duration ? '' : 'permanently'} in ${message.guild} ${!args.duration ? `for ${args.duration}` : ''}`)
      .setDescription(`Reason: \`\`\`${args.reason ?? 'None'}\`\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'ban',
      reason: args.reason,
      expires: args.duration.timestamp ?? 'False',
      duration: args.duration.raw ?? 'Permanent'
    };
    let modlogEntry, expiringPunishmentsEntry;

    try {
      modlogEntry = await createModlogsEntry(message.guild, options);
    } catch (e) {
      await logError(e as Error);
      return message.reply(embeds.error('An error occured while creating the modlog entry. Please contact oxi#6219'));
    }

    if (args.duration.timestamp) {
      try {
        expiringPunishmentsEntry = await createExpiringPunishmentsEntry(message.guild, {
          victimId: args.user.id,
          type: 'ban',
          expires: args.duration.timestamp,
        });
      } catch (e) {
        await logError(e as Error);
        return message.reply(embeds.error('An error occured while creating the expiringPunishments entry. Please contact oxi#6219'));
      }
    }

    const dmMessage = await args.user.send({ embeds: [embed] }).catch(() => null);

    try {
      await message.guild.members.ban(args.user.id, { reason: args.reason });
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      return await message.reply(embeds.success(`${args.user} has been successfully banned`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await expiringPunishmentsEntry?.destroy();
      await logError(e as Error);
      return message.reply(embeds.error('An error has occured while banning the user'));
    }
  }
}