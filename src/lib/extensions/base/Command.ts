import { BaseCommand } from "#base";
import { client } from "../../bot.js";
import { Client } from "./Client.js";
import { CommandHandler } from "./CommandHandler.js";

export abstract class Command extends BaseCommand {
  public client: Client = client;
  public override commandHandler: CommandHandler = client.commandHandler;
}