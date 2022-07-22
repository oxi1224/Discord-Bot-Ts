import { CustomClient } from "../CustomClient.js";
import type { TaskHandlerOptions, ClassConstructor } from "../lib/types.js";
import { TimeInMs } from "../lib/constants.js";
import { Task } from "./Task.js";
import { EventEmitter } from "events";

export class TaskHandler extends EventEmitter {
  private taskArray: Task[] = [];
  public client: CustomClient; 
  public taskExportFile: string;
  public defaultCooldown: number;

  constructor(client: CustomClient, {
    taskExportFile,
    defaultCooldown = TimeInMs.Minute * 1,
  }: TaskHandlerOptions) {
    super();
    this.client = client;
    this.taskExportFile = taskExportFile;
    this.defaultCooldown = defaultCooldown;
  }

  private async loadAll() {
    Object.entries(await import(this.taskExportFile) as { [key: string]: ClassConstructor<Task> })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([key, task]) => {
        const currentTask = new task();
        if (this.taskArray.find(t => t.id === currentTask.id)) throw new Error(`Task IDs must be unique. (${currentTask.id})`);
        currentTask.client = this.client;
        this.taskArray.push(currentTask);
        this.emit('taskLoad', currentTask);
      });
  }

  public start() {
    this.client.once('ready', async () => {
      await this.loadAll();
      this.taskArray.forEach(task => setInterval(() => task.execute(), task.delay ?? this.defaultCooldown));
    });
  }
}