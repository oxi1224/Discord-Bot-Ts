import { BaseCommandHandler, ParsedArgs } from "#base";
import { emotes } from "../../common/constants.js";
import { CacheType, Interaction, Message, InteractionType, GuildMember } from "discord.js";
import { arrayPermissionCheck } from "../../util/moderationUtil.js";
import { embeds } from '#lib';
import { getSetting } from "../../util/guildUtil";

export class CommandHandler extends BaseCommandHandler {

  public override async handle(message: Message) {
    if (!message.guild?.available) return;
    const prefix = await getSetting(message.guild.id, 'prefix') ?? super.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const commandName = message.content.split(' ').shift()?.replace('!', '');
    if (this.aliasReplacement) commandName?.replace(this.aliasReplacement, '');
    const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName ?? ''));
    if (!command) return;

    const botPermsCheck = arrayPermissionCheck(await message.guild.members.fetchMe(), command.clientPermissions);
    if (botPermsCheck !== true) return message.reply(embeds.error(`I am missing the ${botPermsCheck.join(', ')}permissions`)); 
    if (!message.member?.permissions.has(command.userPermissions)) return message.react(emotes.error);

    const args: ParsedArgs | null = await command.parseArgs(message, command.argumentArray);
    return command.execute(message, args);
  }

  public override async handleSlash(interaction: Interaction<CacheType>) {
    if (!(interaction.type === InteractionType.ApplicationCommand)) return;
    if (!interaction.guild?.available) return;

    const commandName = interaction.commandName;
    const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName));
    if (!command) return;

    const botPermsCheck = arrayPermissionCheck(await interaction.guild.members.fetchMe(), command.clientPermissions);
    if (botPermsCheck !== true) return interaction.reply(embeds.error(`I am missing the ${botPermsCheck.join(', ')}permissions`));
    if (!((interaction.member as GuildMember).permissions.has(command.userPermissions))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const args: ParsedArgs | null = await command.parseArgs(interaction, command.argumentArray);
    return command.execute(interaction, args);
  }
}