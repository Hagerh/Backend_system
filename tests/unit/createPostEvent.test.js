import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreatePost } from '../../src/application/post/CreatePost.js';
import { InMemoryPostRepository } from '../../src/infrastructure/database/InMemoryPostRepository.js';
import { FakeEventPublisher } from '../helpers/FakeEventPublisher.js';
import { ValidationError } from '../../src/domain/post/errors.js';

test('CreatePost publishes a PostCreated event', async () => {
  const publisher = new FakeEventPublisher();
  const post = await new CreatePost(new InMemoryPostRepository(), publisher)
    .execute({ title: 'Learning Kafka', content: 'x' });
  assert.equal(publisher.events.length, 1);
  assert.deepEqual(publisher.events[0], {
    eventType: 'PostCreated',
    postId: post.id,
    title: 'Learning Kafka',
    createdAt: post.createdAt.toISOString(),
  });
});

test('no event is published when validation fails', async () => {
  const publisher = new FakeEventPublisher();
  const useCase = new CreatePost(new InMemoryPostRepository(), publisher);
  await assert.rejects(useCase.execute({ title: '', content: 'x' }), ValidationError);
  assert.equal(publisher.events.length, 0);
});

test('a broker failure does not fail the request; the post is still saved', async () => {
  const repo = new InMemoryPostRepository();
  const useCase = new CreatePost(repo, new FakeEventPublisher({ fail: true }));
  const post = await useCase.execute({ title: 'Still saved', content: 'x' });
  assert.ok(await repo.findById(post.id));
});
