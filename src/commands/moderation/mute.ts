import { ParsedDuration } from '#base';
import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, createExpiringPunishmentsEntry, logError, colors, getSetting } from '#lib';

export default class MuteCommand extends Command {
  constructor() {
    super('mute', {
      aliases: ['mute'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to mute'
        },
        {
          id: 'duration',
          type: 'duration',
          slashType: ApplicationCommandOptionType.String,
          description: 'The duration of the mute'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the mute'
        }
      ],
      description: 'mutes a member',
      usage: 'mute <member> [duration] [reason]',
      examples: ['mute @oxi#6219 spamming', 'mute @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.ModerateMembers,
      clientPermissions: [PermissionFlagsBits.ManageRoles]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    duration: ParsedDuration,
    reason: string,
  }) {
    console.log(args, args.reason);
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const mutedRole = await getSetting(message.guild.id, 'mutedRole') as string;
    if (!mutedRole) return message.reply(embeds.error('Mute role has not been set. Please set it via the config command before proceeding'));
    if (!victim) return message.reply(embeds.error(`${victim} is not a member`));
    if (victim?.roles.cache.has(mutedRole)) return message.reply(embeds.error(`${victim} is already muted`));
    if (victim?.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.user} is a staff member`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been muted${args.duration.raw ? '' : ' permanently'} in ${message.guild} ${args.duration.raw ? `for ${args.duration.raw}` : ''}`)
      .setDescription(`Reason: \`\`${args.reason ?? 'None'}\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'mute',
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
          type: 'mute',
          expires: args.duration.timestamp,
        });
      } catch (e) {
        await logError(e as Error);
        return message.reply(embeds.error('An error occured while creating the expiringPunishments entry. Please contact oxi#6219'));
      }
    }

    const dmMessage = await args.user.send({ embeds: [embed] }).catch(() => null);

    try {
      await victim?.roles.add(mutedRole);
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      await message.reply(embeds.success(`${args.user} has been successfully muted`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await expiringPunishmentsEntry?.destroy();
      await logError(e as Error);
      message.reply(embeds.error('An error has occured while adding the muted role'));
    }
    return;
  }
}