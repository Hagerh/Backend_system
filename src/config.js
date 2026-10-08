// The only file that reads process.env. Everything else receives config.
export const config = {
  port: Number(process.env.PORT) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'posts_db',
  },
};
