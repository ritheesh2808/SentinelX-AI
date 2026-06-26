import { EventEmitter } from 'events';

export class SecurityEventBus extends EventEmitter {
  private static instance: SecurityEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): SecurityEventBus {
    if (!SecurityEventBus.instance) {
      SecurityEventBus.instance = new SecurityEventBus();
    }
    return SecurityEventBus.instance;
  }

  /**
   * Publishes an event targeting a specific user.
   */
  public publish(userId: string, eventName: string, data: any) {
    this.emit(`${userId}:${eventName}`, data);
    this.emit(`${userId}:*`, { eventName, data });
  }

  /**
   * Subscribes to all events published to a specific user.
   * Returns a cleanup/unsubscribe callback function.
   */
  public subscribe(userId: string, callback: (event: { eventName: string; data: any }) => void): () => void {
    const handler = (payload: { eventName: string; data: any }) => {
      callback(payload);
    };
    this.on(`${userId}:*`, handler);
    return () => {
      this.off(`${userId}:*`, handler);
    };
  }
}

export const eventBus = SecurityEventBus.getInstance();
