export class KafkaEventConsumer {
  constructor(kafka, { topic, groupId }, handler, logger = console) {
    this.consumer = kafka.consumer({ groupId });
    this.topic = topic;
    this.handler = handler;
    this.logger = logger;
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        let event;
        try {
          event = JSON.parse(message.value.toString());
        } catch {
          this.logger.error('skipping message that is not valid JSON');
          return;
        }
        await this.handler.execute(event);
      },
    });
  }

  async stop() {
    await this.consumer.disconnect();
  }
}
