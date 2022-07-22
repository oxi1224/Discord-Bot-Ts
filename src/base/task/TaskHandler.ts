import { CustomClient } from "../CustomClient.js";
import type { TaskHandlerOptions, ClassConstructor } from "../lib/types.js";
import { TimeInMs } from "../lib/constants.js";
import { Task } from "./Task.js";
import { EventEmitter } from "events";

export class TaskHandler extends EventEmitter {
  /**
   * Array of tasks to handle.
   */
  private taskArray: Task[] = [];

  /**
   * The client of the handler.
   */
  public client: CustomClient;
  
  /**
   * Path to the file containing exports of all classes.
   */
  public exportFileDirectory: string;

  /**
   * The default interval of the tasks.
   */
  public defaultInterval: number;

  /**
   * 
   * @param client - Client object.
   * @param options - Options. 
   */
  constructor(client: CustomClient, {
    taskExportFile,
    defaultInterval = TimeInMs.Minute * 1,
  }: TaskHandlerOptions) {
    super();
    this.client = client;
    this.exportFileDirectory = taskExportFile;
    this.defaultInterval = defaultInterval;
  }

  /**
   * Imports everything from exportFileDirectory, turns the tasks into classes and pushes them to taskArray.
   */
  private async loadAll() {
    Object.entries(await import(this.exportFileDirectory) as { [key: string]: ClassConstructor<Task> })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([key, task]) => {
        const currentTask = new task();
        if (this.taskArray.find(t => t.id === currentTask.id)) throw new Error(`Task IDs must be unique. (${currentTask.id})`);
        currentTask.client = this.client;
        this.taskArray.push(currentTask);
        this.emit('taskLoad', currentTask);
      });
  }

  /**
   * Sets the intervals of each task.
   */
  public start() {
    this.client.once('ready', async () => {
      await this.loadAll();
      this.taskArray.forEach(task => setInterval(() => task.execute(), task.interval ?? this.defaultInterval));
    });
  }
}