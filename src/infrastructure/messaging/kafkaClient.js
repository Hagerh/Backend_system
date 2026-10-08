import { Kafka, logLevel } from 'kafkajs';
// Create a Kafka client with the given brokers and clientId.
export function createKafka({ brokers, clientId }) {
  return new Kafka({ brokers, clientId, logLevel: logLevel.WARN });
}

// Create the topic if it doesn't exist.
export async function ensureTopic(kafka, topic) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    const existing = await admin.listTopics();
    if (!existing.includes(topic)) {
      await admin.createTopics({ topics: [{ topic, numPartitions: 1 }] });
    }
  } finally {
    await admin.disconnect();
  }
}
