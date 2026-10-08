// The only file that reads process.env. Everything else receives config.
export const config = {
  port: Number(process.env.PORT) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'posts_db',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'posts-api',
    topic: process.env.KAFKA_TOPIC || 'posts.created',
    groupId: process.env.KAFKA_GROUP_ID || 'posts-consumer',
  },
};
