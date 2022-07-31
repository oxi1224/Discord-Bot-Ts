import { Snowflake } from "discord.js";
import { GuildConfig, GuildConfigModel } from "../models/GuildConfig.js";
import { client } from "../../bot.js";


export async function getSetting<k extends keyof GuildConfigModel>(
  guildId: Snowflake, 
  setting: k
): Promise<GuildConfigModel[k]> {
  return (client.guildConfigCache.get(guildId) ?? (await GuildConfig.findByPk(guildId) ?? await GuildConfig.create({ id: guildId })))[setting];
}

export async function setSetting<k extends keyof GuildConfigModel>(
  guildId: Snowflake, 
  setting: k, 
  newValue: string
) {
  const config = await GuildConfig.findByPk(guildId) ?? GuildConfig.build({ id: guildId });
  if (['modlogschannel', 'actionschannel'].includes(setting)) config.loggingChannels[setting] = newValue;
  else if (Array.isArray(config[setting])) {
    const values: string[] = config[setting] as string[];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config[setting] = values.some(str => str === newValue) ? values.filter(str => str === newValue) : values.push(newValue);
  }
  else config[setting] = newValue as GuildConfig[k];
  client.guildConfigCache.set(guildId, config.toJSON());
  await config.save();
}