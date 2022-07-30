import { Listener, logAction } from "#lib";
import { EmbedField } from "discord.js";
import { client } from "../../bot.js";

export class MessageListeners extends Listener {
  constructor() {
    super('messageListeners', {
      emitter: client,
      event: 'ready',
      method: 'once'
    });
  }
  
  public override execute() {
    client.on('messageDelete', async message => {
      if (!message.guild || !message.content) return;
      const content = message.content.length > 1000 ? message.content.slice(0, 1000) + '...' : message.content;
      await logAction(message.guild, 'messageDelete', [
        { name: 'Author', value: `${message.author}`, inline: true },
        { name: 'Channel', value: `${message.channel}`, inline: true },
        { name: 'Content', value: message.embeds.length ? 'Embed (unable to display).' : `\`\`${content}\`\``, inline: false },
      ]);
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
      if (!newMessage.guild) return;
      if (!oldMessage.content || !newMessage.content) return;
      const oldContent = oldMessage.content.length > 1000 ? oldMessage.content.slice(0, 1000) + '...' : oldMessage.content;
      const newContent = newMessage.content.length > 1000 ? newMessage.content.slice(0, 1000) + '...' : newMessage.content;
      const fields: EmbedField[] = [
        { name: 'Author', value: `${newMessage.author}`, inline: true },
        { name: 'Channel', value: `${newMessage.channel}`, inline: true },
        { name: 'Link', value: `[Jump](${newMessage.url})`, inline: true },
        { name: 'Old Content', value: `\`\`${oldContent}\`\``, inline: false },
        { name: 'New Content', value: `\`\`${newContent}\`\``, inline: false },
      ];
      await logAction(newMessage.guild, 'messageUpdate', fields);
    });
  }
}