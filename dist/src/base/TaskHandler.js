import { CustomClient } from "./CustomClient";
import { TimeInMs } from "./constants.js";
import { Task } from "./Task.js";
import { EventEmitter } from "events";
export class TaskHandler extends EventEmitter {
    taskArray = [];
    client;
    taskExportFile;
    defaultCooldown;
    constructor(client, { taskExportFile, defaultCooldown = TimeInMs.Minute * 1, }) {
        super();
        this.client = client;
        this.taskExportFile = taskExportFile;
        this.defaultCooldown = defaultCooldown;
    }
    async loadAll() {
        Object.entries(await import(this.taskExportFile))
            .forEach(([key, task]) => {
            const currentTask = new task();
            if (this.taskArray.find(t => t.id === currentTask.id))
                throw new Error(`Task IDs must be unique. (${currentTask.id})`);
            currentTask.client = this.client;
            this.taskArray.push(currentTask);
            this.emit('taskLoad', currentTask);
        });
    }
    start() {
        this.client.once('ready', async () => {
            await this.loadAll();
            console.log(this.taskArray);
            this.taskArray.forEach(task => setInterval(() => task.execute(), task.delay ?? this.defaultCooldown));
        });
    }
}
//# sourceMappingURL=TaskHandler.js.map