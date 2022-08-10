import { colors, Command, embeds, getSetting, logError } from '#lib';
import { type Message, EmbedBuilder, CommandInteraction, ApplicationCommandOptionType, GuildMember, TextBasedChannel } from 'discord.js';

export default class SuggestCommand extends Command {
  constructor() {
    super('suggest', {
      aliases: ['suggest'],
      args: [
        {
          id: 'content',
          type: 'string',
          required: true,
          slashType: ApplicationCommandOptionType.String,
          description: 'The contents of the suggestion'
        },
      ],
      description: 'Suggest a feature',
      usage: 'suggest <feature>',
      examples: ['suggest memes channel'],
      category: 'Other'
    });
  }

  public override async execute(message: Message | CommandInteraction, args: {
    content: string
  }) {
    if (!message.guild?.available) return;
    const author = await message.guild.members.fetch(message.member as GuildMember);
    const suggestionsChannelId = await getSetting(message.guild.id, 'suggestionsChannel');
    if (!suggestionsChannelId) return message.reply(embeds.error('This server has not set a suggestions channel'));
    const suggestionsChannel = await message.guild.channels.fetch(suggestionsChannelId).catch((e) => logError(e as Error));
    if (!suggestionsChannel) return message.reply(embeds.error('Something went wrong while fetching the suggestions channel'));
    if (!args.content) return message.reply(embeds.error('The content of the suggestion cannot be empty'));
    
    const embed = new EmbedBuilder()
      .setTitle(`Author: ${author.user.username}#${author.user.discriminator}`)
      .setThumbnail(author.displayAvatarURL())
      .setFields({ name: 'Suggestion', value: `\`\`${args.content}\`\``, inline: false })
      .setFooter({ text: `Suggest something with the suggest command!` })
      .setColor(colors.base)
      .setTimestamp();
    return (suggestionsChannel as TextBasedChannel).send({ embeds: [embed] }).catch((e) => logError(e as Error));
  }
}