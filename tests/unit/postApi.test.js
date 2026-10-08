import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { InMemoryPostRepository } from '../../src/infrastructure/database/InMemoryPostRepository.js';
import { CreatePost } from '../../src/application/post/CreatePost.js';
import { FakeEventPublisher } from '../helpers/FakeEventPublisher.js';
import { GetPost } from '../../src/application/post/GetPost.js';
import { ListPosts } from '../../src/application/post/ListPosts.js';

let server;
let base;

before(async () => {
  const repo = new InMemoryPostRepository();
  const app = createApp({
    createPost: new CreatePost(repo, new FakeEventPublisher()),
    getPost: new GetPost(repo),
    listPosts: new ListPosts(repo),
  });
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

const post = (body) => fetch(`${base}/api/posts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body,
});

test('POST /api/posts -> 201 with the created post', async () => {
  const res = await post(JSON.stringify({ title: 'Learning Kafka', content: 'First post' }));
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.title, 'Learning Kafka');
  assert.ok(body.id);
});

test('POST /api/posts -> 400 on empty title', async () => {
  const res = await post(JSON.stringify({ title: '', content: 'x' }));
  assert.equal(res.status, 400);
});

test('POST /api/posts -> 400 on malformed JSON', async () => {
  const res = await post('{bad json');
  assert.equal(res.status, 400);
});

test('GET /api/posts/:id -> 200, then 404 for unknown id', async () => {
  const created = await (await post(JSON.stringify({ title: 'A', content: 'B' }))).json();
  const ok = await fetch(`${base}/api/posts/${created.id}`);
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).id, created.id);
  const missing = await fetch(`${base}/api/posts/does-not-exist`);
  assert.equal(missing.status, 404);
});

test('GET /api/posts -> 200 with an array', async () => {
  const res = await fetch(`${base}/api/posts`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});
