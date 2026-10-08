import { config } from './config.js';
import { createApp } from './app.js';
import { connectMongo } from './infrastructure/database/mongoClient.js';
import { MongoPostRepository } from './infrastructure/database/MongoPostRepository.js';
import { createKafka, ensureTopic } from './infrastructure/messaging/kafkaClient.js';
import { KafkaEventPublisher } from './infrastructure/messaging/KafkaEventPublisher.js';
import { CreatePost } from './application/post/CreatePost.js';
import { GetPost } from './application/post/GetPost.js';
import { ListPosts } from './application/post/ListPosts.js';

// Composition root: the only place that knows which concrete classes are used.
const { client, db } = await connectMongo(config.mongodb);
const postRepository = new MongoPostRepository(db);
await postRepository.init();

const kafka = createKafka(config.kafka);
await ensureTopic(kafka, config.kafka.topic);
const eventPublisher = new KafkaEventPublisher(kafka, config.kafka.topic);
await eventPublisher.connect();

const app = createApp({
  createPost: new CreatePost(postRepository, eventPublisher),
  getPost: new GetPost(postRepository),
  listPosts: new ListPosts(postRepository),
});

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

process.on('SIGTERM', async () => {
  server.close();
  await eventPublisher.disconnect();
  await client.close();
});
