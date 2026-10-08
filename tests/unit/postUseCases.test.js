import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreatePost } from '../../src/application/post/CreatePost.js';
import { GetPost } from '../../src/application/post/GetPost.js';
import { ListPosts } from '../../src/application/post/ListPosts.js';
import { InMemoryPostRepository } from '../../src/infrastructure/database/InMemoryPostRepository.js';
import { PostNotFoundError, ValidationError } from '../../src/domain/post/errors.js';

function setup() {
  const repo = new InMemoryPostRepository();
  return {
    createPost: new CreatePost(repo),
    getPost: new GetPost(repo),
    listPosts: new ListPosts(repo),
  };
}

test('CreatePost saves the post, GetPost returns it', async () => {
  const { createPost, getPost } = setup();
  const created = await createPost.execute({ title: 'Hi', content: 'World' });
  const found = await getPost.execute(created.id);
  assert.equal(found.title, 'Hi');
});

test('CreatePost rejects invalid input', async () => {
  const { createPost } = setup();
  await assert.rejects(createPost.execute({ title: '', content: 'x' }), ValidationError);
});

test('GetPost throws PostNotFoundError for an unknown id', async () => {
  const { getPost } = setup();
  await assert.rejects(getPost.execute('nope'), PostNotFoundError);
});

test('ListPosts returns all posts, newest first', async () => {
  const { createPost, listPosts } = setup();
  await createPost.execute({ title: 'first', content: 'a' });
  await new Promise((r) => setTimeout(r, 5));
  await createPost.execute({ title: 'second', content: 'b' });
  const posts = await listPosts.execute();
  assert.deepEqual(posts.map((p) => p.title), ['second', 'first']);
});
