import type { User } from '../../domain/entities/User.js';

declare module 'express-serve-static-core' {
  interface Request {
    actor?: User;
  }
}
