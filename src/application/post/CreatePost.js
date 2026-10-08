import { Post } from '../../domain/post/Post.js';
import { postCreated } from '../../domain/post/PostCreated.js';

export class CreatePost {
  constructor(postRepository, eventPublisher) {
    this.postRepository = postRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ title, content }) {
    const post = Post.create({ title, content });
    await this.postRepository.save(post);

    // The post is already stored: a broker failure must not fail the request.
    try {
      await this.eventPublisher.publish(postCreated(post));
    } catch (err) {
      console.error('failed to publish PostCreated event:', err.message);
    }
    return post;
  }
}
