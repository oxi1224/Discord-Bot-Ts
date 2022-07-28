import { Listener, logError } from "#lib";

export class unhandledRejection extends Listener {
  constructor() {
    super('unhandledRejection', {
      emitter: process,
      event: 'unhandledRejection'
    });
  }
  
  public override async execute(err: Error) {
    if (!err) return;
    return await logError(err);
  }   
}