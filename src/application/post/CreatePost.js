import { Post } from '../../domain/post/Post.js';

export class CreatePost {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute({ title, content }) {
    const post = Post.create({ title, content });
    await this.postRepository.save(post);
    return post;
  }
}
