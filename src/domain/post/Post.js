import { randomUUID } from 'node:crypto';
import { ValidationError } from './errors.js';

const MAX_TITLE_LENGTH = 200;

export class Post {
  constructor({ id, title, content, createdAt }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
  }

  // Business rules live here: the only way to build a NEW post.
  static create({ title, content }) {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanContent = typeof content === 'string' ? content.trim() : '';

    if (!cleanTitle) throw new ValidationError('title is required');
    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      throw new ValidationError(`title must be at most ${MAX_TITLE_LENGTH} characters`);
    }
    if (!cleanContent) throw new ValidationError('content is required');

    return new Post({
      id: randomUUID(),
      title: cleanTitle,
      content: cleanContent,
      createdAt: new Date(),
    });
  }
}
