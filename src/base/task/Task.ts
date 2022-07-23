import { CustomClient } from "../CustomClient.js";
import type { TaskOptions } from "../lib/types.js";

export abstract class Task {
  /**
   * Unique id of the task.
   */
  public id: string;

  /**
   * How often to run the command
   */
  public interval?: number;

  /**
   * The client of the task.
   */
  public client?: CustomClient;

  /**
   * @param id - Unique id of the task.
   * @param options - Options. 
   */
  constructor(id: string, {
    interval,
  }: TaskOptions) {
    this.id = id;
    this.interval = interval;
  }

  /**
   * The function to execute. 
   */
  public execute() {
    throw new Error(`Execute function empty in task ${this.id}.`);
  }

  set clientSetter(client: CustomClient) {
    this.client = client;
  }
}