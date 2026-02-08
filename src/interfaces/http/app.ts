import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { buildContainer } from '../../infrastructure/di/container.js';
import { router } from './routes.js';

const allowedOrigins = ['http://localhost:3000'];

export const createApp = () => {
  const app = express();
  const container = buildContainer();

  app.set('container', container);
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      }
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(express.json({ limit: '10kb' }));

  app.use(router);

  return app;
};
