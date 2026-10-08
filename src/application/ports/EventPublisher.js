// The contract the application needs for announcing events.
// Implementations (log, Kafka, ...) live in the infrastructure layer.
export class EventPublisher {
  async publish(event) {
    throw new Error('EventPublisher.publish not implemented');
  }
}
