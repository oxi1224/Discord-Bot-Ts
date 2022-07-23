import { BaseTask } from "#base";
import { client } from "../../bot.js";
import { Client } from "./Client.js";
import { TaskHandler } from "./TaskHandler.js";

export abstract class Task extends BaseTask {
  public client: Client = client;
  public override taskHandler: TaskHandler = client.taskHandler;
}