import { Client, ClientOptions, Snowflake, UserResolvable } from 'discord.js';
import { CommandHandler } from './command/CommandHandler.js';
import { TaskHandler } from './task/TaskHandler.js';
import { CustomClientOptions } from './lib/types.js';
import { ListenerHandler } from './listener/ListenerHandler.js';

export class CustomClient extends Client {
  public owners: Snowflake[];
  public commandHandler?: CommandHandler;
  public taskHandler?: TaskHandler;
  public listenerHandler?: ListenerHandler;

  constructor(clientOptions: ClientOptions, {
    owners = [],
  }: CustomClientOptions) {
    super(clientOptions);
    this.owners = owners;
  }

  public isOwner(user: UserResolvable): boolean {
    const id = this.users.resolveId(user) as Snowflake;
    return this.owners.includes(id ?? '');
  }
}