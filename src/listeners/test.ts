import { Message } from "discord.js";
import { Listener } from "#base";
import { client } from "../bot.js";

export class TestListener extends Listener {
  constructor() {
    super('testListener', {
      emitter: client,
      event: 'messageCreate'
    });
  }

  public override execute(message: Message): void {
    console.log(message);
  }
}