import express from 'express';
import { createPostController } from './api/controllers/postController.js';
import { createPostRoutes } from './api/routes/postRoutes.js';
import { errorHandler } from './api/middleware/errorHandler.js';

export function createApp(useCases) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'posts-api' });
  });

  app.use('/api/posts', createPostRoutes(createPostController(useCases)));

  app.use((req, res) => res.status(404).json({ error: 'route not found' }));
  app.use(errorHandler);
  return app;
}
