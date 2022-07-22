import { ListenerOptions } from '../lib/types.js';
import { EventEmitter } from 'events';
import { CustomClient } from '../CustomClient.js';
import { ListenerHandler } from './ListenerHandler.js';

export class Listener {
  public id: string;
  public emitter: EventEmitter;
  public event: string;
  public client?: CustomClient;
  public listenerHandler?: ListenerHandler;

  constructor(id: string, {
    emitter,
    event,
  }: ListenerOptions) {
    this.id = id;
    this.emitter = emitter,
    this.event = event;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(value: unknown) {
    throw new Error(`Execute function cannot be empty. ${this.id}`);
  }

  set clientSetter(client: CustomClient) {
    this.client = client;
    this.listenerHandler = client.listenerHandler;
  }
}