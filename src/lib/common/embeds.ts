import { EmbedBuilder } from "discord.js";
import { colors, emotes } from "./constants.js";

export const success = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.success)
      .setDescription(`${emotes.success} ${text}`)]
  };
};

export const error = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.error)
      .setDescription(`${emotes.error} ${text}`)]
  };
};

export const info = (text: string) => { 
  return {
    embeds: [new EmbedBuilder()
      .setColor(colors.info)
      .setDescription(`${emotes.info} ${text}`)]
  };
};