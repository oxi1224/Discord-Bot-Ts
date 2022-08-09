import { BaseCommandHandler, ParsedArgs } from "#base";
import { emotes } from "../../common/constants.js";
import { CacheType, Interaction, Message, InteractionType, GuildMember } from "discord.js";
import { arrayPermissionCheck } from "../../util/moderationUtil.js";
import { embeds } from '#lib';
import { getConfig } from "../../util/guildUtil.js";

export class CommandHandler extends BaseCommandHandler {

  public override async handle(message: Message) {
    if (!message.guild?.available) return;
    const config = await getConfig(message.guild.id);
    const prefix = config.prefix ?? super.prefix;
    const commandChannels = config.commandChannels;
    const automodImmune = config.automodImmune;
    if (!message.content.startsWith(prefix) || message.author.bot) return;    

    const commandName = message.content.split(' ').shift()?.replace(prefix, '').toLowerCase();
    if (this.aliasReplacement) commandName?.replace(this.aliasReplacement, '');
    const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName ?? ''));
    if (!command) return;

    const botPermsCheck = arrayPermissionCheck(await message.guild.members.fetchMe(), command.clientPermissions);
    if (botPermsCheck !== true) return message.reply(embeds.error(`I am missing the ${botPermsCheck.join(', ')}permissions`)); 
    if (!message.member?.permissions.has(command.userPermissions)) return message.react(emotes.error);
    if (!commandChannels.includes(message.channelId) && !automodImmune.includes(message.author.id) && !message.member.permissions.has('Administrator')) return message.react(emotes.error);

    const args: ParsedArgs | null = await command.parseArgs(message, command.argumentArray);
    return command.execute(message, args);
  }

  public override async handleSlash(interaction: Interaction<CacheType>) {
    if (!(interaction.type === InteractionType.ApplicationCommand)) return;
    if (!interaction.guild?.available) return;

    const config = await getConfig(interaction.guild.id);
    const commandChannels = config.commandChannels;
    const automodImmune = config.automodImmune;
    const commandName = interaction.commandName;
    const command = this.commandArray.find(cmd => cmd.aliases.includes(commandName));
    if (!command) return;

    const botPermsCheck = arrayPermissionCheck(await interaction.guild.members.fetchMe(), command.clientPermissions);
    if (botPermsCheck !== true) return interaction.reply(embeds.error(`I am missing the ${botPermsCheck.join(', ')}permissions`));
    if (!((interaction.member as GuildMember).permissions.has(command.userPermissions))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    if (!commandChannels.includes(interaction.channelId) && !automodImmune.includes(interaction.user.id) && !(interaction.member as GuildMember).permissions.has('Administrator')) return interaction.reply({
      content: 'Please use commands in appropriate channel(s).',
      ephemeral: true
    });

    const args: ParsedArgs | null = await command.parseArgs(interaction, command.argumentArray);
    return command.execute(interaction, args);
  }
}