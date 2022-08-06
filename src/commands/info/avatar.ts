import { Message, User, GuildMember, EmbedBuilder, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Command, colors } from '#lib';

export default class AvatarCommand extends Command {
  constructor() {
    super('avatar', {
      aliases: ['avatar', 'av'],
      args: [
        {
          id: 'user',
          type: 'user',
          slashType: ApplicationCommandOptionType.User,
          description: 'The user whose avatar to display'
        }
      ],
      description: "Displays a user's avatar",
      usage: 'av [user]',
      examples: ['av', 'av @oxi#6219'],
      category: 'Info'
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    user: User
  }) {
    if (!message.guild?.available) return;
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const user = args.user ?? author.user;
    const embed = new EmbedBuilder()
      .setFooter({ text: `ID: ${user.id}` })
      .setTimestamp()
      .setColor(colors.base)
      .setTitle(`${user.username}#${user.discriminator}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 4096 }));
    return message.reply({ embeds: [embed] });
  }
}