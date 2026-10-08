import { PostNotFoundError } from '../../domain/post/errors.js';

export class GetPost {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id) {
    const post = await this.postRepository.findById(id);
    if (!post) throw new PostNotFoundError(id);
    return post;
  }
}
