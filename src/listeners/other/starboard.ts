import { colors, getSetting, Listener } from "#lib";
import { Collection, EmbedBuilder, MessageReaction, TextBasedChannel } from "discord.js";
import { client } from "../../bot.js";

export class Starboard extends Listener {
  constructor() {
    super('starboard', {
      emitter: client,
      event: 'messageReactionAdd',
    });
  }
  
  public override async execute(reaction: MessageReaction) {
    if (reaction.emoji.name !== '⭐') return;
    if (!reaction.message.guild?.available) return;
    const guild = reaction.message.guild;
    const channel = await guild.channels.fetch(await getSetting(guild.id, 'starboardChannel'));
    if (channel instanceof Collection) return;
    const message = reaction.message;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const messageAuthor = message.author!;
    if (!(reaction.count >= 5)) return;
    const embed = new EmbedBuilder()
      .setColor(colors.base)
      .setAuthor({ name: `Author: ${messageAuthor.username}#${messageAuthor.discriminator}`, iconURL: messageAuthor.displayAvatarURL() })
      .setDescription(`Sent at <t:${message.createdTimestamp}> in ${message.channel}`)
      .setFields([{
        name: 'Content',
        value: `${message.content}`,
        inline: false
      }])
      .setTimestamp();
    (channel as TextBasedChannel).send({ embeds: [embed] });
  }
}