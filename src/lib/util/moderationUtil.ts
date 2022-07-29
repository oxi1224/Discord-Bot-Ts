import { GuildMember } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

export function arrayPermissionCheck<k extends keyof typeof PermissionFlagsBits>(
  member: GuildMember | null,
  perms: (typeof PermissionFlagsBits[k])[]): string[] | true {
  const missingPerms: string[] = [];

  perms.forEach(perm => {
    if (member?.permissions.has(perm)) return;
    const valueToAdd = Object.keys(PermissionFlagsBits).find(k => PermissionFlagsBits[k as keyof typeof PermissionFlagsBits] === perm);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    missingPerms.push(valueToAdd!);
  });
  return missingPerms.length === 0 ? true : missingPerms;
}