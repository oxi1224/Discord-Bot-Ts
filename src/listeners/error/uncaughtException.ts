import { Listener, logError } from "#lib";

export class uncaughtException extends Listener {
  constructor() {
    super('uncaughtException', {
      emitter: process,
      event: 'uncaughtException'
    });
  }
  
  public override async execute(err: Error) {
    if (this.client.enviroment === 'dev') throw err;
    if (!err) return;
    return await logError(err);
  }
}