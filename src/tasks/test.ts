import { Task } from "#base";

export default class TestTask extends Task {
  constructor() {
    super('test', {});
  }

  public override execute() {
    console.log('test task');
  }
}