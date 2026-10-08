import { MongoClient } from 'mongodb';

export async function connectMongo({ uri, dbName }) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  return { client, db: client.db(dbName) };
}
