import { BaseListener } from "#base";
import { client } from "../../bot.js";
import { Client } from "./Client.js";
import { ListenerHandler } from "./ListenerHandler.js";

export abstract class Listener extends BaseListener {
  public client: Client = client;
  public override listenerHandler: ListenerHandler = client.listenerHandler;
}