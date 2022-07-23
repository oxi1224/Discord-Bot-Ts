import { Task } from "#lib";

export default class TestTask extends Task {
  constructor() {
    super('test', {});
  }

  public override execute() {
    return;
  }
}