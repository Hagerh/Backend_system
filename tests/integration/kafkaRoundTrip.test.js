import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKafka, ensureTopic } from '../../src/infrastructure/messaging/kafkaClient.js';
import { KafkaEventPublisher } from '../../src/infrastructure/messaging/KafkaEventPublisher.js';
import { KafkaEventConsumer } from '../../src/infrastructure/messaging/KafkaEventConsumer.js';
import { postCreated } from '../../src/domain/post/PostCreated.js';
import { Post } from '../../src/domain/post/Post.js';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

async function brokerReachable(kafka) {
  const admin = kafka.admin();
  try {
    await admin.connect();
    await admin.disconnect();
    return true;
  } catch {
    return false;
  }
}

test('an event published to Kafka reaches the consumer handler', async (t) => {
  const kafka = createKafka({ brokers, clientId: 'roundtrip-test' });
  if (!(await brokerReachable(kafka))) return t.skip('Kafka not reachable');

  const topic = `posts.created.test.${Date.now()}`; // throwaway topic
  await ensureTopic(kafka, topic);

  const received = [];
  const consumer = new KafkaEventConsumer(
    kafka,
    { topic, groupId: `test-${Date.now()}` },
    { execute: async (event) => received.push(event) },
  );
  const publisher = new KafkaEventPublisher(kafka, topic);

  try {
    await consumer.start();
    await publisher.connect();
    const event = postCreated(Post.create({ title: 'Round trip', content: 'x' }));
    await publisher.publish(event);

    const deadline = Date.now() + 15000;
    while (received.length === 0 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 200));
    }
    assert.deepEqual(received, [event]);
  } finally {
    await publisher.disconnect();
    await consumer.stop();
    const admin = kafka.admin();
    await admin.connect();
    await admin.deleteTopics({ topics: [topic] });
    await admin.disconnect();
  }
});
