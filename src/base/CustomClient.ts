import { Client, ClientOptions, UserResolvable } from 'discord.js';
import { CommandHandler } from './command/CommandHandler.js';
import { TaskHandler } from './task/TaskHandler.js';
import { CustomClientOptions } from './lib/types.js';

export class CustomClient extends Client {
  public owners: UserResolvable[];
  public specialUsers: UserResolvable[];
  public commandHandler?: CommandHandler;
  public taskHandler?: TaskHandler;

  constructor(clientOptions: ClientOptions, {
    owners = [],
    specialUsers = []
  }: CustomClientOptions) {
    super(clientOptions);
    this.owners = owners;
    this.specialUsers = specialUsers;
  }

  public isOwner(user: UserResolvable): boolean {
    const id = this.users.resolveId(user);
    return this.owners.includes(id ?? '');
  }

  public isSpecial(user: UserResolvable): boolean {
    const id = this.users.resolveId(user);
    return this.specialUsers.includes(id ?? '');
  }
}