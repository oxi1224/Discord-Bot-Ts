import { CommandInteraction, GuildMember, Message } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { emotes } from "../common/constants.js";

export function permissionCheck<k extends keyof typeof PermissionFlagsBits>(
  action: Message | CommandInteraction, 
  member: GuildMember | null, 
  perms: typeof PermissionFlagsBits[k]) {
  if (!member) return false;
  const hasPerms: boolean = member.permissions.has(perms);
  if (!hasPerms) {
    if (action instanceof Message) return action.react(emotes.error);
    return action.reply({ content: 'Insufficient Permissions', ephemeral: true });
  }
  return hasPerms;
}