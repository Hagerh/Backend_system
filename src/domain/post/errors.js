export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PostNotFoundError extends Error {
  constructor(id) {
    super(`post ${id} not found`);
    this.name = 'PostNotFoundError';
  }
}
