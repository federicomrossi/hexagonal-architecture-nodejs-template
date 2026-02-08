import type { IUserRepository } from '../../domain/repositories/IUserRepository.ts';
import type { CreateUserData } from '../../domain/entities/UserEntity.ts';
import type { PolicyContext } from '../../shared/types/ABAC.ts';
import { Result } from '../../shared/utils/Result.ts';
import { UserEntity } from '../../domain/entities/UserEntity.ts';
import { PolicyEngine } from '../services/PolicyEngine.ts';
import { auditLogger } from '../../infrastructure/security/logger.ts';
import { ConflictError, ForbiddenError } from '../../shared/errors/ApplicationError.ts';

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
  department?: string;
  requesterId: string;
  requesterRole: string;
  requesterDepartment?: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private policyEngine: PolicyEngine
  ) {}

  public async execute(request: CreateUserRequest): Promise<Result<UserEntity>> {
    try {
      await this.validateBusinessRules(request);
      await this.checkABACPermissions(request);

      const userData: CreateUserData = {
        name: request.name,
        email: request.email,
        role: request.role || 'user',
        department: request.department
      };

      const createdUser = await this.userRepository.create(userData);

      this.logAuditEvent('USER_CREATED', 'SUCCESS', {
        userId: createdUser.id,
        userEmail: createdUser.email,
        userRole: createdUser.role,
        requesterId: request.requesterId,
        requesterRole: request.requesterRole
      });

      return Result.success(createdUser);
    } catch (error) {
      this.logAuditEvent('USER_CREATED', 'FAILURE', {
        userEmail: request.email,
        requesterId: request.requesterId,
        requesterRole: request.requesterRole,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof ConflictError || error instanceof ForbiddenError) {
        return Result.failure(error);
      }

      return Result.failure(new Error('Failed to create user'));
    }
  }

  private async validateBusinessRules(request: CreateUserRequest): Promise<void> {
    const emailExists = await this.userRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new ConflictError('User with this email already exists');
    }
  }

  private async checkABACPermissions(request: CreateUserRequest): Promise<void> {
    const context: PolicyContext = {
      user: {
        id: request.requesterId,
        role: request.requesterRole,
        department: request.requesterDepartment,
        attributes: {}
      },
      resource: {
        type: 'user',
        id: 'new',
        attributes: {
          email: request.email,
          role: request.role || 'user',
          department: request.department
        }
      },
      action: 'create',
      environment: {
        time: new Date(),
        ip: '',
        device: ''
      }
    };

    const evaluation = this.policyEngine.evaluate(context);

    const auditData = {
      userId: request.requesterId,
      userRole: request.requesterRole,
      action: 'create_user',
      resourceType: 'user',
      resourceAttributes: context.resource.attributes,
      environment: context.environment,
      decision: evaluation.allowed ? 'ALLOWED' : 'DENIED',
      reason: evaluation.reason,
      appliedPolicies: evaluation.appliedPolicies
    };

    if (evaluation.allowed) {
      auditLogger.info('ABAC authorization successful', auditData);
    } else {
      auditLogger.warn('ABAC authorization denied', auditData);
      throw new ForbiddenError(evaluation.reason || 'Access denied by policy');
    }
  }

  private logAuditEvent(action: string, result: string, details: Record<string, any>): void {
    auditLogger.info(`Use case execution: ${action}`, {
      action,
      result,
      timestamp: new Date(),
      ...details
    });
  }
}