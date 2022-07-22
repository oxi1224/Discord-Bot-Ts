import 'dotenv/config';
import { EventEmitter } from 'events';
import { Interaction, Message, SlashCommandBuilder, InteractionType } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Command } from '../command/Command.js';
import { slashOptions } from '../lib/constants.js';
import type { CommandHandlerOptions, ClassConstructor, ParsedArgs } from '../lib/types.js';
import { CustomClient } from '../CustomClient.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '');

export class CommandHandler extends EventEmitter {
  private commandArray: Command[] = [];
  private exportFileDirectory: string;
  private prefix: string;
  public client: CustomClient;
  public flagRegex: RegExp;
  public aliasReplacement: RegExp | undefined;

  constructor(client: CustomClient, {
    commandExportFile,
    prefix = '!',
    flagRegex = /--.+/,
    aliasReplacement,
  }: CommandHandlerOptions) {
    super();
    this.client = client;
    this.exportFileDirectory = commandExportFile;
    this.prefix = prefix;
    this.flagRegex = flagRegex;
    this.aliasReplacement = aliasReplacement;
  }
  
  private async loadAll() {
    const slashCommands: SlashCommandBuilder[] = [];
    Object.entries(await import(this.exportFileDirectory) as { [key: string]: ClassConstructor<Command> })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([key, command]) => {
        const cmd = new command();
        if (this.commandArray.find(c => c.id === cmd.id)) throw new Error(`Command IDs must be unique. (${cmd.id})`);
        cmd.client = this.client;
        this.commandArray.push(cmd);
        if (cmd.slash) this.loadSlash(cmd, slashCommands);
      });
  }

  public async loadSlash(command: Command, slashCommands: SlashCommandBuilder[]) {
    const name = command.id;
    const args = command.args;
    const description = command.description;
    const slashCommand = new SlashCommandBuilder();

    if (name) slashCommand.setName(name);
    if (description) slashCommand.setDescription(description);
    if (args.length !== 0) 
      args.forEach(arg => slashOptions[arg.slashType?.toString() as keyof typeof slashOptions](slashCommand, arg));
    
    slashCommands.push(slashCommand);
    try {
      this.emit('slashLoadStart', slashCommand);
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
        { body: slashCommands },
      );
      this.emit('slashLoadFinish', slashCommand);
    } catch (error) {
      console.error(error);
    }
  }

  public start() {
    this.client.once('ready', async () => {
      await this.loadAll();
      this.client.on('messageCreate', async (message: Message) => {
        if (!message.content.startsWith(this.prefix) || message.author.bot) return;
        const commandName = message.content.split(' ').shift()?.replace('!', '');
        if (this.aliasReplacement) commandName?.replace(this.aliasReplacement, '');
        const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName ?? ''));
        if (!command) return;
        const args: ParsedArgs | null = await command.parseArgs(message, command.argumentArray);
        command.execute(message, args);
      });

      this.client.on('interactionCreate', async (interaction: Interaction) => {
        if (!(interaction.type === InteractionType.ApplicationCommand)) return;
        const commandName = interaction.commandName;
        const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName));
        if (!command) return;
        const args: ParsedArgs | null = await command.parseArgs(interaction, command.argumentArray);
        command.execute(interaction, args);
      });
    });
  }
}