import humanizeDuration from 'humanize-duration';
import { Message, User, GuildMember, EmbedBuilder, CommandInteraction, EmbedField } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command, colors } from '#lib';

export default class UserCommand extends Command {
  constructor() {
    super('user', {
      aliases: ['user', 'u', 'userinfo'],
      args: [
        {
          id: 'user',
          type: 'user',
          slashType: ApplicationCommandOptionType.User,
          description: 'The user to display info about'
        }
      ],
      description: 'Displays info about a user',
      usage: 'u [user]',
      examples: ['u', 'u @oxi#6219'],
      category: 'Info'
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User
  }) {
    if (!message.guild?.available) return;
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const user = args.user ?? author.user;
    const member = user.id === author.id ? author : await message.guild.members.fetch(args.user).catch(() => null);
    const embed = new EmbedBuilder()
      .setDescription(`${user}`)
      .setFooter({ text: `ID: ${user.id}` })
      .setTimestamp()
      .setThumbnail(user.displayAvatarURL())
      .setColor(colors.base)
      .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: user.displayAvatarURL() });
    const fields: EmbedField[] = [
      {
        name: 'Created at:', 
        value: `<t:${Math.floor(user.createdTimestamp / 1000)}>\n(${humanizeDuration(user.createdTimestamp - new Date().getTime(), { largest: 3 })})`,
        inline: true
      }
    ];

    if (member) {
      if (!member.joinedTimestamp) return;
      fields.push(...[
        {
          name: 'Joined at:', 
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}>\n(${humanizeDuration(member.joinedTimestamp - new Date().getTime(), { largest: 3 })})`,
          inline: true 
        },
        {
          name: 'Presence',
          value: `» **Status**: ${member.presence ? `${member.presence.status} \n${this.getActivities(member)}` : 'offline'}`,
          inline: false
        },
        {
          name: `Roles[${member.roles.cache.size}]`,
          value: member.roles.cache.size !== 0 ? `${member.roles.cache.toJSON().join(' ')}` : 'User has no roles',
          inline: false
        }
      ]);
      embed.setColor(member.displayHexColor);
    }
    embed.setFields(fields);
    return message.reply({ embeds: [embed] });
  }

  private getActivities(member: GuildMember) {
    if (!member || !member.presence) return;
    const dataToAdd: string[] = [];
    if (!member.presence.activities || member.presence.activities.length === 0) return '';
    member.presence.activities.forEach(activity => {
      if (activity.name === 'Custom Status') return dataToAdd.push(`» **Custom Status**: \`\`${activity.state}\`\``);
      return dataToAdd.push(`» **Activity**: \`\`${activity.name}\`\``);
    });
    return dataToAdd.join('\n');
  }
}