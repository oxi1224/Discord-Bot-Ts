import { EmbedBuilder } from "discord.js";
import { colors, emotes } from "./constants.js";

export const success = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.success)
      .setTitle(`${emotes.success} ${text}`)]
  };
};

export const error = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.error)
      .setTitle(`${emotes.error} ${text}`)]
  };
};

export const info = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.info)
      .setTitle(`${emotes.info} ${text}`)]
  };
};