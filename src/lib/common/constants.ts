import { ColorResolvable, Colors, EmojiResolvable } from "discord.js";

export const colors: {[key: string]: ColorResolvable} = Object.freeze({
  base: "#0099ff",
  error: "#ef4047",
  success: "#3fa45d",
  info: "#cb8715",
  ...Colors
} as const);

export const emotes: {[key: string]: EmojiResolvable} = Object.freeze({
  "error": "<:error:980866363461599292>",
  "success": "<:success:980866382323396723>",
  "info": "<:info:980866381283201025>"
});

export const otherIDs = {
  parentGuild: "613024666079985702",
  mainError: "980478015412772884",
  guildCreate: "1002916757222195280",
  guildDelete: "1002916792831844422" 
};

export const whsRules = [
  '<:starry_blob:941271221738303549>   » **Follow Discord and Roblox Terms of Services**',
  '<:blob_heart:941271083078791168> » **Respect your fellow members! Any forms of disrespect/harassment will not be tolerated!**',
  '<:blob_glasses:941271069480853504> » **Swearing __is__ allowed, however the following is not:**',
  '» *Excessive swearing*',
  '» *Sexual/Inappropriate topics*',
  '» *Derogatory terms*',
  '<:blob_scared:941271116796817439> » **Disruptive behavior/controversial subjects are not allowed! (Religion/Politics)**',
  '<:blob_crying:941271055572533320> » **NSFW content is strictly prohibited!**',
  '<:blob_crying:941271055572533320> » **Spamming is not allowed!**',
  '<:happy_blob:941271190603976705> » **Do not excessively ping roles!**',
  '<:happy_blob:941271190603976705> » **Advertising of any form is not allowed! (Includes DMs!)**',
  '<:blob_skull:941271133217509436>  » **Any discussion that breaks Roblox TOS is not allowed!**',
  '» *Cheating/Exploiting*',
  '» *Cross-trading*',
  '**In general, just be a good person. Think if your mom was here, would she approve?**'
];