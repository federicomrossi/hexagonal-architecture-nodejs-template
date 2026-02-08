import { createContainer, asClass, asValue, Lifetime } from 'awilix';
import type { AwilixContainer } from 'awilix';
import type { Express } from 'express';

import { InMemoryUserRepository } from '../infrastructure/database/InMemoryUserRepository.ts';
import type { IUserRepository } from '../domain/repositories/IUserRepository.ts';

import { PolicyEngine } from '../application/services/PolicyEngine.ts';
import { CreateUserUseCase } from '../application/usecases/CreateUserUseCase.ts';

import { UserController } from '../presentation/controllers/UserController.ts';
import { userRoutes } from '../presentation/routes/index.ts';

import { configureSecurity } from '../infrastructure/security/SecurityConfig.ts';
import { requestLogger, errorHandler } from '../presentation/middleware/error.ts';
import { logger } from '../infrastructure/security/logger.ts';

export interface AppDependencies {
  userRepository: IUserRepository;
  policyEngine: PolicyEngine;
  createUserUseCase: CreateUserUseCase;
  userController: UserController;
}

export const configureContainer = (app: Express): AwilixContainer => {
  const container = createContainer<AppDependencies>();

  container.register({
    userRepository: asClass(InMemoryUserRepository).singleton(),
    
    policyEngine: asClass(PolicyEngine).singleton(),
    
    createUserUseCase: asClass(CreateUserUseCase).singleton(),
    
    userController: asClass(UserController).singleton(),
  });

  const policyEngine = container.resolve<PolicyEngine>('policyEngine');
  const defaultPolicies = PolicyEngine.createDefaultPolicies();
  defaultPolicies.forEach(policy => policyEngine.addPolicy(policy));

  app.locals.container = container;
  
  return container;
};

export const setupRoutes = (app: Express, container: AwilixContainer): void => {
  const userController = container.resolve<UserController>('userController');
  
  app.use('/api', userRoutes(userController));
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
};

export const setupMiddleware = (app: Express): void => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  configureSecurity(app);
  
  app.use(requestLogger);
};

export const setupErrorHandling = (app: Express): void => {
  app.use(errorHandler);
  
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`
    });
  });
};