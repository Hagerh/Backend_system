import { EventPublisher } from '../../application/ports/EventPublisher.js';

export class LogEventPublisher extends EventPublisher {
  async publish(event) {
    console.log('[event published]', JSON.stringify(event));
  }
}
