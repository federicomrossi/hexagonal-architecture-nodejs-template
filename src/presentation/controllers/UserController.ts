import type { Request, Response } from 'express';
import type { CreateUserRequest } from '../../application/usecases/CreateUserUseCase.ts';
import { CreateUserUseCase } from '../../application/usecases/CreateUserUseCase.ts';
import { auditLogger } from '../../infrastructure/security/logger.ts';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const requestBody = req.body;

      const createRequest: CreateUserRequest = {
        name: requestBody.name,
        email: requestBody.email,
        role: requestBody.role,
        department: requestBody.department,
        requesterId: user.id,
        requesterRole: user.role,
        requesterDepartment: user.attributes?.department
      };

      const result = await this.createUserUseCase.execute(createRequest);

      if (result.isFailure) {
        const error = result.error;
        
        if (error instanceof Error && error.message.includes('already exists')) {
          res.status(409).json({
            error: 'Conflict',
            message: error.message
          });
          return;
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
          res.status(403).json({
            error: 'Forbidden',
            message: error.message
          });
          return;
        }

        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create user'
        });
        return;
      }

      const createdUser = result.value;

      auditLogger.info('Controller: User created successfully', {
        userId: createdUser.id,
        userEmail: createdUser.email,
        requesterId: user.id,
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        data: createdUser.toJSON()
      });
    } catch (error) {
      auditLogger.error('Controller: User creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestBody: req.body,
        timestamp: new Date()
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = (req as any).user;

      res.status(200).json({
        success: true,
        data: {
          userId,
          message: 'This is a test endpoint - user retrieval would be implemented here'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user'
      });
    }
  }
}