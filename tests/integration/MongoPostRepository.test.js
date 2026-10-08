import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectMongo } from '../../src/infrastructure/database/mongoClient.js';
import { MongoPostRepository } from '../../src/infrastructure/database/MongoPostRepository.js';
import { Post } from '../../src/domain/post/Post.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = `posts_test_${Date.now()}`; // throwaway database, dropped afterwards
let client, db, repo, skip;

before(async () => {
  try {
    ({ client, db } = await connectMongo({ uri, dbName }));
    repo = new MongoPostRepository(db);
    await repo.init();
  } catch {
    skip = 'MongoDB not reachable';
  }
});

after(async () => {
  if (db) await db.dropDatabase();
  if (client) await client.close();
});

test('save then findById returns an equal Post entity', async (t) => {
  if (skip) return t.skip(skip);
  const post = Post.create({ title: 'Mongo', content: 'persisted' });
  await repo.save(post);
  const found = await repo.findById(post.id);
  assert.ok(found instanceof Post);
  assert.deepEqual(found, post);
});

test('findById returns null for an unknown id', async (t) => {
  if (skip) return t.skip(skip);
  assert.equal(await repo.findById('missing'), null);
});

test('findAll returns newest first', async (t) => {
  if (skip) return t.skip(skip);
  const older = Post.create({ title: 'older', content: 'a' });
  await repo.save(older);
  await new Promise((r) => setTimeout(r, 5));
  const newer = Post.create({ title: 'newer', content: 'b' });
  await repo.save(newer);
  const all = await repo.findAll();
  const titles = all.map((p) => p.title);
  assert.ok(titles.indexOf('newer') < titles.indexOf('older'));
});
