import { createApp } from './app.js';
import { InMemoryPostRepository } from './infrastructure/database/InMemoryPostRepository.js';
import { CreatePost } from './application/post/CreatePost.js';
import { GetPost } from './application/post/GetPost.js';
import { ListPosts } from './application/post/ListPosts.js';

const PORT = process.env.PORT || 3000;

// Composition root: the only place that knows which concrete classes are used.
const postRepository = new InMemoryPostRepository();
const app = createApp({
  createPost: new CreatePost(postRepository),
  getPost: new GetPost(postRepository),
  listPosts: new ListPosts(postRepository),
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
