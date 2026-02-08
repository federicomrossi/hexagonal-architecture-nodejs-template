import { CreateUserUseCase } from '../../../src/application/usecases/CreateUserUseCase.ts';
import { InMemoryUserRepository } from '../../../src/infrastructure/database/InMemoryUserRepository.ts';
import { PolicyEngine } from '../../../src/application/services/PolicyEngine.ts';
import { UserEntity } from '../../../src/domain/entities/UserEntity.ts';

describe('CreateUserUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let policyEngine: PolicyEngine;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    policyEngine = new PolicyEngine();
    
    const defaultPolicies = PolicyEngine.createDefaultPolicies();
    defaultPolicies.forEach(policy => policyEngine.addPolicy(policy));
    
    useCase = new CreateUserUseCase(userRepository, policyEngine);
  });

  it('should create user successfully when admin requests', async () => {
    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      requesterId: 'admin-123',
      requesterRole: 'admin'
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('John Doe');
    expect(result.value.email).toBe('john@example.com');
    expect(result.value.role).toBe('user');
  });

  it('should fail when user with email already exists', async () => {
    const existingUser = UserEntity.create({
      name: 'Existing User',
      email: 'john@example.com'
    });
    await userRepository.create(existingUser.toJSON());

    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      requesterId: 'admin-123',
      requesterRole: 'admin'
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('User with this email already exists');
  });

  it('should fail when non-admin tries to create user', async () => {
    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      requesterId: 'user-123',
      requesterRole: 'user'
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Access denied');
  });

  it('should allow user to update themselves (self-management policy)', async () => {
    policyEngine.addPolicy({
      name: 'user-self-create',
      effect: 'Permit',
      priority: 100,
      condition: (ctx) => 
        ctx.user.id === ctx.resource.attributes.requesterId
    });

    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      requesterId: 'user-123',
      requesterRole: 'user'
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('John Doe');
  });
});