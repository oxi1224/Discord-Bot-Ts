import { ParsedDuration } from '#base';
import { Message, User, GuildMember, EmbedBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, createExpiringPunishmentsEntry, logError, colors } from '#lib';

export default class BlockCommand extends Command {
  constructor() {
    super('block', {
      aliases: ['block'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to block'
        },
        {
          id: 'duration',
          type: 'duration',
          slashType: ApplicationCommandOptionType.String,
          description: 'The duration of the block'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the block'
        }
      ],
      description: 'Blocks a member from the current channel',
      usage: 'block <user> [duration] [reason]',
      examples: ['block @oxi#6219 spamming', 'block @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.BanMembers,
      clientPermissions: [PermissionFlagsBits.ManageChannels]
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
    if (!victim) return message.reply(embeds.error(`${args.user} is not in the server`));
    if (!(message.channel as TextChannel)?.permissionsFor(victim).has(PermissionFlagsBits.ViewChannel)) return message.reply(embeds.error(`${victim} already can't access this channel.`));
    if (victim?.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.user} is a staff member`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been blocked${args.duration?.raw ? '' : ' permanently'} in ${message.guild} from ${(message.channel as TextChannel).name} ${args.duration?.raw ? `for ${args.duration.raw}` : ''}`)
      .setDescription(`Reason: \`\`${args.reason ?? 'None'}\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'block',
      reason: args.reason,
      expires: args.duration?.timestamp,
      duration: args.duration?.raw ?? 'Permanent',
      extraInfo: `Channel: <#${message.channel?.id}>`
    };
    let modlogEntry, expiringPunishmentsEntry;

    try {
      modlogEntry = await createModlogsEntry(message.guild, options);
    } catch (e) {
      await logError(e as Error);
      return message.reply(embeds.error('An error occured while creating the modlog entry. Please contact oxi#6219'));
    }

    if (args.duration?.timestamp) {
      try {
        expiringPunishmentsEntry = await createExpiringPunishmentsEntry(message.guild, {
          victimId: args.user.id,
          type: 'block',
          expires: args.duration.timestamp,
          extraInfo: `Channel: <#${message.channelId}>`
        });
      } catch (e) {
        await logError(e as Error);
        return message.reply(embeds.error('An error occured while creating the expiringPunishments entry. Please contact oxi#6219'));
      }
    }

    const dmMessage = await args.user.send({ embeds: [embed] }).catch(() => null);
    try {
      await (message.channel as TextChannel).edit({
        permissionOverwrites: [{
          id: victim.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }]
      });
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      await message.reply(embeds.success(`${args.user} has been successfully blocked from ${message.channel}`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await expiringPunishmentsEntry?.destroy();
      await logError(e as Error);
      message.reply(embeds.error('An error has occured while blocking the user'));
    }
    return;
  }
}