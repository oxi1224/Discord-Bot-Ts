import { Listener, colors } from "#lib";
import { EmbedBuilder, EmbedField, TextChannel } from "discord.js";

export class unhandledRejection extends Listener {
  constructor() {
    super('unhandledRejection', {
      emitter: process,
      event: 'unhandledRejection'
    });
  }
  
  public override async execute(err: Error) {
    if (!err) return;
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor(colors.error);

    const fields: EmbedField[] = [{ name: 'Error:', value: `\`\`\`${err}\`\`\``, inline: false }];
    const stack = err.stack ?? '';
    if (stack.length > 1000) {
      let fieldIndex = 1;
      for (let i = 0; i < stack.length; i += 1000) {
        const cont = stack.substring(i, Math.min(stack.length, i + 1000));
        fields.push({ name: `Call Stack[${fieldIndex}]`, value: `\`\`\`js\n${cont} \`\`\``, inline: false });
        fieldIndex++;
      }
    } else {
      fields.push({ name: 'Call Stack', value: `\`\`\`js\n${err.stack} \`\`\``, inline: false });
    }
    embed.addFields(fields);
    (await (await this.client.guilds.fetch('613024666079985702')).channels.fetch('980478015412772884') as TextChannel)?.send({ embeds: [embed] });
  }
}