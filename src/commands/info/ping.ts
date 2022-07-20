import { Command } from '#base';
import { type Message, EmbedBuilder, CommandInteraction } from 'discord.js';

export default class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
      args: [],
      description: 'Gets the latency of the bot',
    });
  }

  public override execute(message: Message | CommandInteraction) {
    const timeDifferece = new Date().getTime() - message.createdTimestamp;
    this.command(message, timeDifferece);
  }

  private command(message: Message | CommandInteraction, timeDifferece: number) {
    const apiPing = message.client.ws.ping;
    const embed = new EmbedBuilder()
      .addFields([
        { name: 'Bot latency', value: `\`\`${Math.round(timeDifferece)}ms\`\``, inline: true },
        { name: 'Api latency', value: `\`\`${Math.round(apiPing)}ms\`\``, inline: true }
      ]);
    return message.reply({
      embeds: [embed]
    });
  }
}