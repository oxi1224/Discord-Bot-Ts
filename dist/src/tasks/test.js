import { Task } from "#base";
export default class TestTask extends Task {
    constructor() {
        super('test', {});
    }
    execute() {
        console.log('test task');
    }
}
//# sourceMappingURL=test.js.map