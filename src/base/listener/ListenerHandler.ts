import 'dotenv/config';
import { EventEmitter } from 'events';
import type { ListenerHandlerOptions, ClassConstructor } from '../lib/types.js';
import { BaseListener } from './Listener.js';
import { CustomClient } from '../CustomClient.js';

export class BaseListenerHandler extends EventEmitter {
  /**
   * Array of listeners to handle.
   */
  private listenerArray: BaseListener[] = [];

  /**
   * Path to the file containing exports of all classes.
   */
  private exportFileDirectory: string;

  /**
   * The client of the handler.
   */
  public client: CustomClient;

  /**
   * @param client - Client object.
   * @param options - Options. 
   */
  constructor(client: CustomClient, {
    listenerExportFile,
  }: ListenerHandlerOptions) {
    super();
    this.client = client;
    this.exportFileDirectory = listenerExportFile;
  }
  
  /**
   * Imports everything from exportFileDirectory, turns the listeners into classes and pushes them to listenerArray.
   */
  private async loadAll() {
    Object.entries(await import(this.exportFileDirectory) as { [key: string]: ClassConstructor<BaseListener> })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([key, command]) => {
        const listener = new command();
        if (this.listenerArray.find(l => l.id === l.id)) throw new Error(`Listener IDs must be unique. (${listener.id})`);
        this.listenerArray.push(listener);
      });
  }

  /**
   * Starts the listeners.
   */
  public start() {
    this.client.once('ready', async () => {
      await this.loadAll();
      this.listenerArray.forEach(listener => {
        listener.emitter.on(listener.event, (val) => listener.execute(val));
        this.emit('listenerLoad', listener);
      });
    });
  }
}