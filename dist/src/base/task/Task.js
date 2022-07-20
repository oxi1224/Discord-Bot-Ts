import { CustomClient } from "../CustomClient.js";
export class Task {
    id;
    autoStart;
    delay;
    client;
    constructor(id, { autoStart = true, delay, }) {
        this.id = id;
        this.autoStart = autoStart;
        this.delay = delay;
    }
    execute() {
        throw new Error(`Execute function empty in task ${this.id}.`);
    }
    set clientSetter(client) {
        this.client = client;
    }
}
//# sourceMappingURL=Task.js.map