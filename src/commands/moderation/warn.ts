import { Message, CommandInteraction, User, EmbedBuilder, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { colors, Command, createModlogsEntry, embeds, logError, ModlogUtilOptions, sendModlog } from '#lib';

export default class WarnCommand extends Command {
  constructor() {
    super('warn', {
      aliases: ['warn'],
      args: [
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to warn'
        },
        {
          id: 'reason',
          type: 'string',
          slashType: ApplicationCommandOptionType.String,
          description: 'The reason of the warn'
        }
      ],
      description: 'Warns a member',
      usage: 'warn <member> <reason>',
      examples: ['warn @oxi#6219 spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.ModerateMembers
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User,
    reason: string
  }) {
    if (!message.guild?.available) return;
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    if (!victim) return message.reply(embeds.error(`${victim} is not a member`));

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`You've been warned in ${message.guild}`)
      .setDescription(`Reason: \`\`${args.reason ?? 'None'}\`\``);
    const options: ModlogUtilOptions = {
      moderatorId: author.id,
      victimId: args.user.id,
      type: 'warn',
      reason: args.reason,
    };

    let modlogEntry;
    try {
      modlogEntry = await createModlogsEntry(message.guild, options);
    } catch (e) {
      await logError(e as Error);
      return message.reply(embeds.error('An error occured while creating the modlog entry. Please contact oxi#6219'));
    }

    try {
      await victim.send({ embeds: [embed] });
      await message.reply(embeds.success(`${args.user} has been successfully warned`));
      await sendModlog(message.guild, Object.assign(options, { id: modlogEntry.id }));
    } catch {
      message.reply(embeds.info(`Failed to DM ${args.user}, action still performed`));
    }
    return;
  }
}