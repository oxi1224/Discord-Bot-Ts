import { Command, colors } from '#lib';
import { type Message, EmbedBuilder, CommandInteraction, EmbedField } from 'discord.js';
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help'],
      args: [{
        id: 'command',
        description: 'The command to display info about.',
        type: 'string',
        slashType: ApplicationCommandOptionType.String
      }],
      description: 'Displays info about a command',
      usage: 'help [command]',
      examples: ['help', 'help ban'],
      category: 'Info'
    });
  }

  public override execute(message: Message | CommandInteraction, args: {
    command: string
  }) {
    const commands = this.commandHandler.commandArray;
    const embed = new EmbedBuilder();
    const categories: (string|null)[] = [...new Set(commands.map(obj => obj ? obj.category : null))];
    const fields: EmbedField[] = [];
    if (!args.command) {
      categories.forEach(category => {
        if (!category) return;
        const categoryField: string[] = [];
        commands.forEach(cmd => {
          if (!cmd) return;
          if (cmd.category.includes(category)) categoryField.push(`\`\`${cmd.aliases[0]}\`\``);
        });
        fields.push({ name: category, value: categoryField.join(' '), inline: false });
      });
      embed.setFooter({ text: 'For more information on a command do help [command].' });
    }

    if (args.command) {
      const matchingCommand: Command = commands.filter(obj => obj ? obj.aliases.includes(args.command) : null)[0] as Command;
      if (!matchingCommand) return message.reply('Invalid command');
      embed.setTitle(`${matchingCommand.id} command`);
      fields.push(
        { name: 'Usage', value: `\`\`${matchingCommand.usage}\`\``, inline: false },
        { name: 'Example', value: matchingCommand.examples.map(str => `\`\`${str}\`\``).join('\n'), inline: false },
        { name: 'Aliases', value: matchingCommand.aliases.map(str => `\`\`${str}\`\``).join(' '), inline: false }
      );

      if (matchingCommand.args.length !== 0) {
        const commandArgs: string[] = [];
        matchingCommand.args.forEach(arg => {
          commandArgs.push(`
\`\`${arg.required ? `<${arg.id}>` : `[${arg.id}]`}\`\`
» **Desc**: ${arg.description}
» **Type**: ${arg.type}
          `.trim());
        });
        fields.push({ name: 'Arguments', value: commandArgs.join('\n'), inline: false });
      }
      if (matchingCommand.extraInfo) fields.push({ name: 'Extra Information', value: matchingCommand.extraInfo, inline: false }); 
    }
    embed.addFields(fields)
      .setColor(colors.base);
    return message.reply({ embeds: [embed] });   
  }
}