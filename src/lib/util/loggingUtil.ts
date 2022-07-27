import { Guild, EmbedBuilder, TextChannel, EmbedField } from "discord.js";
import { Modlogs, type PunishmentInfo } from "../models/Modlogs.js";
import { nanoid } from "nanoid";
import { ExpiringPunishments, type ExpiringPunishmentInfo } from "../models/ExpiringPunishments.js";
import { getSetting } from "./guildUtil.js";

export type ModlogUtilOptions = Omit<PunishmentInfo, 'guildId' | 'id'>

export async function createModlogsEntry(guild: Guild, options: ModlogUtilOptions) {
  const entry = Modlogs.build({
    guildId: guild.id,
    id: nanoid(),
    moderatorId: options.moderatorId,
    victimId: options.victimId,
    type: options.type,
    reason: options.reason ?? 'None',
    expires: options.expires ?? 'False',
    duration: options.duration ?? 'Permanent'
  });
  return await entry.save();
}

export async function createExpiringPunishmentsEntry(guild: Guild, options: Omit<ExpiringPunishmentInfo, 'guildId'>) {
  const entry = ExpiringPunishments.build({
    victimId: options.victimId,
    guildId: guild.id,
    type: options.type,
    expires: options.expires,
    extraInfo: options.extraInfo
  });
  return await entry.save();
}

export async function logPunishment(guild: Guild, options: ModlogUtilOptions) {
  const moderator = await guild.members.fetch(options.moderatorId);
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setAuthor({ name: `${moderator.user.username}#${moderator.user.discriminator}` })
    .setThumbnail(moderator.displayAvatarURL())
    .setTitle(`Punishment: ${options.type}`)
    .setFields([
      { name: 'Moderator', value: `${moderator}`, inline: true },
      { name: 'Victim', value: `<${options.victimId}>`, inline: true },
      { name: 'Reason', value: options.reason ?? 'None', inline: true },
      { name: 'Duration', value: options.duration ?? 'Permanent', inline: true },
      { name: 'Expires', value: options.expires ? `<t:${Math.floor(parseInt(options.expires.toString()) / 1000)}>` : 'False', inline: true },
    ]);
  const channelId = (await getSetting(guild.id, 'loggingChannels')).modlogs;
  if (!channelId) return;
  return (await guild.channels.fetch(channelId) as TextChannel).send({ embeds: [embed] });
}

export async function logAction(guild: Guild, title: string, fields: EmbedField[]) {
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setTitle(title)
    .setFields(fields);

  const channelId = (await getSetting(guild.id, 'loggingChannels')).actionLogs ?? (await getSetting(guild.id, 'loggingChannels')).modlogs;
  if (!channelId) return;
  return (await guild.channels.fetch(channelId) as TextChannel).send({ embeds: [embed] });
}
