import { config } from './config.js';
import { createKafka, ensureTopic } from './infrastructure/messaging/kafkaClient.js';
import { KafkaEventConsumer } from './infrastructure/messaging/KafkaEventConsumer.js';
import { ProcessPostCreated } from './application/post/ProcessPostCreated.js';

// Composition root for the consumer process.
const kafka = createKafka({ ...config.kafka, clientId: `${config.kafka.clientId}-consumer` });
await ensureTopic(kafka, config.kafka.topic);

const consumer = new KafkaEventConsumer(kafka, config.kafka, new ProcessPostCreated());
await consumer.start();
console.log(`Consumer listening on topic "${config.kafka.topic}" (group "${config.kafka.groupId}")`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await consumer.stop();
    process.exit(0);
  });
}
