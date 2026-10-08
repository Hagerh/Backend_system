import { ValidationError, PostNotFoundError } from '../../domain/post/errors.js';

// Express recognises error middleware by its 4 parameters.
export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof PostNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
}
