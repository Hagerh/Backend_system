import { Partitioners } from 'kafkajs';
import { EventPublisher } from '../../application/ports/EventPublisher.js';
//sender of events to kafka topic
export class KafkaEventPublisher extends EventPublisher {
  constructor(kafka, topic) {
    super();
    this.producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
    this.topic = topic;
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
  }
//take the PostCreated event and turn it into text "json " and put it in the kafka topic
  async publish(event) {
    await this.producer.send({
      topic: this.topic,
      // Same key -> same partition -> events about one post stay in order.
      messages: [{ key: event.postId, value: JSON.stringify(event) }],
    });
  }
}
