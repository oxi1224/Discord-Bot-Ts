import { Guild, EmbedBuilder, TextChannel, EmbedField } from "discord.js";
import { Modlogs, type PunishmentInfo } from "../models/Modlogs.js";
import { nanoid } from "nanoid";
import { ExpiringPunishments, type ExpiringPunishmentInfo } from "../models/ExpiringPunishments.js";
import { getSetting } from "./guildUtil.js";
import { colors, otherIDs } from "../common/constants.js";
import { client } from "../../bot.js";

export type ModlogUtilOptions = Omit<PunishmentInfo, 'guildId' | 'id'>

export async function createModlogsEntry(guild: Guild, options: ModlogUtilOptions) {
  const entry = Modlogs.build({
    id: nanoid(),
    guildId: guild.id,
    victimId: options.victimId,
    moderatorId: options.moderatorId,
    type: options.type,
    reason: options.reason ?? 'None',
    expires: options.expires,
    duration: options.duration,
    timestamp: new Date().getTime()
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

export async function sendModlog(guild: Guild, options: Omit<PunishmentInfo, 'guildId'>) {
  const moderator = await guild.members.fetch(options.moderatorId);
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setColor(colors.base)
    .setAuthor({ name: `${moderator.user.username}#${moderator.user.discriminator}` })
    .setThumbnail(moderator.displayAvatarURL())
    .setTitle(`Action: ${options.type}`);
  const fields: EmbedField[] = [
    { name: 'Moderator', value: `${moderator}`, inline: true },
    { name: 'Victim', value: `<@${options.victimId}>`, inline: true },
    { name: 'Case ID', value: options.id, inline: true },
    { name: 'Reason', value: options.reason ?? 'None', inline: true },
  ];
  if (options.duration) fields.push({ name: 'Duration', value: options.duration ?? 'Permanent', inline: true });
  if (options.expires) fields.push({ name: 'Expires', value:`<t:${Math.floor(options.expires / 1000)}>`, inline: true });

  embed.setFields(fields);

  const channelId = (await getSetting(guild.id, 'loggingChannels')).modlogsChannel;
  if (!channelId) return;
  return (await guild.channels.fetch(channelId) as TextChannel).send({ embeds: [embed] });
}

export async function logAction(guild: Guild, action: string, fields: EmbedField[]) {
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setColor(colors.base)
    .setTitle(`Action: ${action}`)
    .setFields(fields);

  const channelId = (await getSetting(guild.id, 'loggingChannels')).actionsChannel;
  if (!channelId) return;
  return (await guild.channels.fetch(channelId) as TextChannel).send({ embeds: [embed] });
}

export async function logError(err: Error) {
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
  (await (await client.guilds.fetch(otherIDs.parentGuild)).channels.fetch(otherIDs.mainError) as TextChannel)?.send({ embeds: [embed] });
}