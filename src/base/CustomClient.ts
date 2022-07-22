import { Client, ClientOptions, Snowflake, UserResolvable } from 'discord.js';
import { CommandHandler } from './command/CommandHandler.js';
import { TaskHandler } from './task/TaskHandler.js';
import { CustomClientOptions } from './lib/types.js';
import { ListenerHandler } from './listener/ListenerHandler.js';

export class CustomClient extends Client {
  /**
   * The owners of the bot.
   */
  public owners: Snowflake[];

  /**
   * The command handler of the client.
   */
  public commandHandler?: CommandHandler;

  /**
   * The task handler of the client.
   */
  public taskHandler?: TaskHandler;
  
  /**
   * The listener handler of the client.
   */
  public listenerHandler?: ListenerHandler;

  /**
   * @param clientOptions - Options for the Discord.js Client class
   * @param options - Options for the custom client. 
   */
  constructor(clientOptions: ClientOptions, {
    owners = [],
  }: CustomClientOptions) {
    super(clientOptions);
    this.owners = owners;
  }

  /**
   * Checks if given user is an owner of the bot.
   * @param user - The user to check.
   * @returns Wether or not the user is an owner of the bot.
   */
  public isOwner(user: UserResolvable): boolean {
    const id = this.users.resolveId(user) as Snowflake;
    return this.owners.includes(id ?? '');
  }
}