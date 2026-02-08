import { Router } from 'express';
import { UserController } from '../controllers/UserController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { rbacMiddleware } from '../middleware/rbac.ts';

export const userRoutes = (userController: UserController): Router => {
  const router = Router();

  router.post(
    '/users',
    authenticateToken,
    rbacMiddleware('users:write'),
    userController.createUser.bind(userController)
  );

  router.get(
    '/users/:id',
    authenticateToken,
    rbacMiddleware('users:read'),
    userController.getUserById.bind(userController)
  );

  return router;
};