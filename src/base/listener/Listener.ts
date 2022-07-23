import { ListenerOptions } from '../lib/types.js';
import { EventEmitter } from 'events';
import { CustomClient } from '../CustomClient.js';
import { ListenerHandler } from './ListenerHandler.js';

export abstract class Listener {
  /**
   * Unique id of the Listener.
   */
  public id: string;

  /**
   * The emitter which emits specified event.
   */
  public emitter: EventEmitter;

  /**
   * The event to listen for.
   */
  public event: string;

  /**
   * The client of the listener.
   */
  public client?: CustomClient;

  /**
   * The handler of the listener.
   */
  public listenerHandler?: ListenerHandler;

  /**
   * @param id - The unique id of the listener.
   * @param options - Options.
   */
  constructor(id: string, {
    emitter,
    event,
  }: ListenerOptions) {
    this.id = id;
    this.emitter = emitter,
    this.event = event;
  }

  /**
   * The function which gets executed on specified event.
   * @param value - Any object which the event returns. 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(value: unknown) {
    throw new Error(`Execute function cannot be empty. ${this.id}`);
  }

  set clientSetter(client: CustomClient) {
    this.client = client;
    this.listenerHandler = client.listenerHandler;
  }
}