// The consumer's reaction to a PostCreated event.
// Kept free of Kafka so it can be tested and changed on its own.
export class ProcessPostCreated {
  constructor(logger = console) {
    this.logger = logger;
  }

  async execute(event) {
    this.logger.log(
      `Received PostCreated event | Post ID: ${event.postId} | Title: ${event.title} | Created at: ${event.createdAt}`,
    );
  }
}
