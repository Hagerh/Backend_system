import { PostRepository } from '../../domain/post/PostRepository.js';

export class InMemoryPostRepository extends PostRepository {
  constructor() {
    super();
    this.posts = new Map();
  }

  async save(post) {
    this.posts.set(post.id, post);
  }

  async findById(id) {
    return this.posts.get(id) ?? null;
  }

  async findAll() {
    return [...this.posts.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
}
