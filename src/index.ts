import express from 'express';
import { configureContainer, setupMiddleware, setupRoutes, setupErrorHandling } from './infrastructure/container.ts';
import { logger } from './infrastructure/security/logger.ts';

const app = express();

setupMiddleware(app);

const container = configureContainer(app);

setupRoutes(app, container);

setupErrorHandling(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API endpoints: http://localhost:${PORT}/api`);
});

export default app;