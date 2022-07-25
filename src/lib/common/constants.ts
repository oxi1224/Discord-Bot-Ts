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