import 'dotenv/config';
import { EventEmitter } from 'events';
import type { ListenerHandlerOptions, ClassConstructor } from '../lib/types.js';
import { Listener } from './Listener.js';
import { CustomClient } from '../CustomClient.js';

export class ListenerHandler extends EventEmitter {
  private listenerArray: Listener[] = [];
  private exportFileDirectory: string;
  public client: CustomClient;

  constructor(client: CustomClient, {
    listenerExportFile,
  }: ListenerHandlerOptions) {
    super();
    this.client = client;
    this.exportFileDirectory = listenerExportFile;
  }
  
  private async loadAll() {
    Object.entries(await import(this.exportFileDirectory) as { [key: string]: ClassConstructor<Listener> })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([key, command]) => {
        const listener = new command();
        if (this.listenerArray.find(l => l.id === l.id)) throw new Error(`Listener IDs must be unique. (${listener.id})`);
        listener.client = this.client;
        this.listenerArray.push(listener);
      });
  }

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