import { EmbedBuilder } from "discord.js";
import { colors, emotes } from "./constants.js";

export const success = (text: string) => new EmbedBuilder()
  .setColor(colors.success)
  .setDescription(`${emotes.success} ${text}`);

export const error = (text: string) => new EmbedBuilder()
  .setColor(colors.error)
  .setDescription(`${emotes.error} ${text}`);

export const info = (text: string) => new EmbedBuilder()
  .setColor(colors.info)
  .setDescription(`${emotes.info} ${text}`);