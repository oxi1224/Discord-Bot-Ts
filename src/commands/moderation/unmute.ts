import { ParsedDuration } from '#base';
import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, createModlogsEntry, sendModlog, ModlogUtilOptions, logError, colors, getSetting } from '#lib';

export default class UnMute extends Command {
  constructor() {
    super('unmute', {
      aliases: ['unmute'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to unmute'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the unmute'
        }
      ],
      description: 'unmutes a member',
      usage: 'unmute <member> [reason]',
      examples: ['unmute @oxi#6219 said sorry'],
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
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const mutedRole = await getSetting(message.guild.id, 'mutedRole') as string;
    if (!mutedRole) return message.reply(embeds.error('Mute role has not been set. Please set it via the config command before proceeding'));
    if (!victim) return message.reply(embeds.error(`${victim} is not a member`));
    if (!victim?.roles.cache.has(mutedRole)) return message.reply(embeds.error(`${victim} is not muted`));
    
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been unmuted in ${message.guild}`)
      .setDescription(`Reason: \`\`${args.reason ?? 'None'}\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'unmute',
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
      await victim?.roles.remove(mutedRole);
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
      if (!dmMessage) return await message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
      await message.reply(embeds.success(`${args.user} has been successfully unmuted`));    
    } catch (e) {
      await modlogEntry?.destroy();
      await logError(e as Error);
      message.reply(embeds.error('An error has occured while removing the muted role'));
    }
    return;
  }
}