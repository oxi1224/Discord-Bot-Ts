import { CustomClient } from "../CustomClient.js";
import type { TaskOptions } from "../lib/types.js";

export class Task {
  public id: string;
  public autoStart: boolean;
  public delay?: number;
  public client?: CustomClient;

  constructor(id: string, {
    autoStart = true,
    delay,
  }: TaskOptions) {
    this.id = id;
    this.autoStart = autoStart;
    this.delay = delay;
  }

  public execute() {
    throw new Error(`Execute function empty in task ${this.id}.`);
  }

  set clientSetter(client: CustomClient) {
    this.client = client;
  }
}