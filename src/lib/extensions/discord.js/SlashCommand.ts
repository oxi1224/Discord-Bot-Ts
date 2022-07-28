import { CommandInteraction } from "discord.js";

export class SlashCommand extends CommandInteraction {
  public author = this.member;
}