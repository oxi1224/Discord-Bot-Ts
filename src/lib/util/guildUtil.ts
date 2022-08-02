import { Snowflake } from "discord.js";
import { GuildConfig, GuildConfigModel } from "../models/GuildConfig.js";
import { client } from "../../bot.js";

export async function getSetting<k extends keyof GuildConfigModel>(
  guildId: Snowflake, 
  setting: k
): Promise<GuildConfigModel[k]> {
  return (client.guildConfigCache.get(guildId) ?? (await GuildConfig.findByPk(guildId) ?? await GuildConfig.create({ id: guildId })))[setting];
}

export async function getConfig(guildId: Snowflake): Promise<GuildConfigModel> {
  return client.guildConfigCache.get(guildId) ?? (await GuildConfig.findByPk(guildId) ?? await GuildConfig.create({ id: guildId }));
}

export async function setSetting<k extends keyof GuildConfigModel>(
  guildId: Snowflake, 
  setting: k, 
  newValue: GuildConfigModel[k]
) {
  const config = (await GuildConfig.findByPk(guildId) ?? GuildConfig.build({ id: guildId }));
  config[setting] = newValue as GuildConfig[k];
  await config.save();
  client.guildConfigCache.set(guildId, config.toJSON());
}