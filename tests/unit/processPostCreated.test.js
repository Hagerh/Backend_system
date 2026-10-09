import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProcessPostCreated } from '../../src/application/post/ProcessPostCreated.js';

test('ProcessPostCreated logs the post id and title', async () => {
  const lines = [];
  await new ProcessPostCreated({ log: (l) => lines.push(l) }).execute({
    eventType: 'PostCreated',
    postId: 'abc-123',
    title: 'Hello',
    createdAt: '2026-10-08T00:00:00.000Z',
  });
  assert.equal(lines.length, 1);
  assert.match(lines[0], /abc-123/);
  assert.match(lines[0], /Hello/);
});
