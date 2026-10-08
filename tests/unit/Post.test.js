import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Post } from '../../src/domain/post/Post.js';
import { ValidationError } from '../../src/domain/post/errors.js';

test('creates a post with id and createdAt', () => {
  const post = Post.create({ title: ' Learning Kafka ', content: 'Hello' });
  assert.equal(post.title, 'Learning Kafka');
  assert.ok(post.id);
  assert.ok(post.createdAt instanceof Date);
});

test('rejects an empty title', () => {
  assert.throws(() => Post.create({ title: '  ', content: 'x' }), ValidationError);
});

test('rejects missing content', () => {
  assert.throws(() => Post.create({ title: 'x' }), ValidationError);
});

test('rejects a title longer than 200 characters', () => {
  assert.throws(() => Post.create({ title: 'a'.repeat(201), content: 'x' }), ValidationError);
});
