import { Listener, logError } from "#lib";

export class uncaughtException extends Listener {
  constructor() {
    super('uncaughtException', {
      emitter: process,
      event: 'uncaughtException'
    });
  }
  
  public override async execute(err: Error) {
    if (!err) return;
    return await logError(err);
  }
}