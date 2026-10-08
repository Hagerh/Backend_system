import { Router } from 'express';

export function createPostRoutes(controller) {
  const router = Router();
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  return router;
}
