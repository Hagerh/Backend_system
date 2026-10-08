import { EventPublisher } from '../../src/application/ports/EventPublisher.js';

export class FakeEventPublisher extends EventPublisher {
  constructor({ fail = false } = {}) {
    super();
    this.events = [];
    this.fail = fail;
  }

  async publish(event) {
    if (this.fail) throw new Error('broker down');
    this.events.push(event);
  }
}
