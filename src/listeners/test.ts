import { Message } from "discord.js";
import { Listener } from "#lib";
import { client } from "../bot.js";

export class TestListener extends Listener {
  constructor() {
    super('testListener', {
      emitter: client,
      event: 'messageCreate'
    });
  }

  public override execute(message: Message): void {
    return;
  }
}