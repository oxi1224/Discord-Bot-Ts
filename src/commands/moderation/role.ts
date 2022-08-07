import { Message, User, CommandInteraction, Role, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord-api-types/v10";
import { Command, embeds, logError } from '#lib';

export default class RoleCommand extends Command {
  constructor() {
    super('role', {
      aliases: ['role'],
      args: [
        {
          id: 'method',
          type: 'string',
          required: true,
          slashType: ApplicationCommandOptionType.String,
          length: 1,
          options: [
            { name: 'Add', value: 'add' },
            { name: 'Remove', value: 'remove' }
          ],
          description: 'The method to execute'
        },
        {
          id: 'user',
          type: 'user',
          required: true,
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to add or remove the role from'
        },
        {
          id: 'role',
          type: 'role',
          required: true,
          slashType: ApplicationCommandOptionType.Role,
          description: 'The role to add or remove'
        }
      ],
      description: 'mutes a member',
      usage: 'mute <member> [duration] [reason]',
      examples: ['mute @oxi#6219 spamming', 'mute @oxi#6219 7d spamming'],
      category: 'Moderation',
      userPermissions: PermissionFlagsBits.ManageRoles,
      clientPermissions: [PermissionFlagsBits.ManageRoles]
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    method: string,
    user: User,
    role: Role,
  }) {
    if (!message.guild?.available) return;
    if (!args.method || !['add', 'remove'].includes(args.method)) return message.reply(embeds.error('Invalid method'));
    if (!args.user) return message.reply(embeds.error('Invalid user'));
    const victim = await message.guild.members.fetch(args.user).catch(() => null);
    const author = await message.guild.members.fetch(message.member as GuildMember);
    if (!args.role) return message.reply(embeds.error('Invalid role.'));
    if (args.role.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply(embeds.error(`${args.role} has moderation permissions`));
    if (!victim) return message.reply(embeds.error(`${victim} is not in the guild`));
    if (args.method === 'add' && victim.roles.cache.has(args.role.id)) return message.reply(embeds.error(`${victim} already has ${args.role}`));
    if (args.method === 'remove' && !victim.roles.cache.has(args.role.id)) return message.reply(embeds.error(`${victim} does not have ${args.role}`));
    if (args.role.position > author.roles.highest.position) return message.reply(embeds.error(`${args.role} has higher hierarchy than your highest role`));

    try {
      args.method === 'add' ? victim.roles.add(args.role) : victim.roles.remove(args.role);
      await message.reply(embeds.success(`Successfully ${args.method === 'add' ? `added ${args.role} to` : `removed ${args.role} from`} ${args.user}`));
    } catch (e) {
      await logError(e as Error);
      message.reply(embeds.error('An error has occured while performing this command'));
    }
    return;
  }
}