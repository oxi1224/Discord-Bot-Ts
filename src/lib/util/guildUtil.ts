import { Snowflake } from "discord.js";
import { GuildConfig, GuildConfigModel } from "../models/GuildConfig";
import { client } from "src/bot.js";


export async function getSetting<k extends keyof GuildConfigModel>(guildId: Snowflake, setting: k): Promise<GuildConfigModel[k]> {
  return (client.guildConfigCache.get(guildId) ?? (await GuildConfig.findByPk(guildId) ?? await GuildConfig.create({ id: guildId })))[setting];
}

export async function setSetting<k extends keyof GuildConfigModel>(guildId: Snowflake, setting: k, newValue: GuildConfigModel[k]) {
  const config = await GuildConfig.findByPk(guildId) ?? GuildConfig.build({ id: guildId });
  config[setting] = newValue as GuildConfig[k];
  client.guildConfigCache.set(guildId, config.toJSON());
  await config.save();
}