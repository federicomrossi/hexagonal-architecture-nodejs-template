import { InMemoryUserRepository } from '../../../src/infrastructure/database/InMemoryUserRepository.ts';
import { UserEntity } from '../../../src/domain/entities/UserEntity.ts';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should create user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const user = await repository.create(userData);

    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('should find user by id', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const createdUser = await repository.create(userData);
    const foundUser = await repository.findById(createdUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBe(createdUser.id);
    expect(foundUser?.email).toBe(userData.email);
  });

  it('should return null when user not found by id', async () => {
    const user = await repository.findById('non-existent-id');
    expect(user).toBeNull();
  });

  it('should find user by email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    await repository.create(userData);
    const foundUser = await repository.findByEmail('john@example.com');

    expect(foundUser).not.toBeNull();
    expect(foundUser?.email).toBe(userData.email);
  });

  it('should return null when user not found by email', async () => {
    const user = await repository.findByEmail('non-existent@example.com');
    expect(user).toBeNull();
  });

  it('should update user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const createdUser = await repository.create(userData);
    const updatedUser = await repository.update(createdUser.id, {
      name: 'John Smith',
      role: 'manager'
    });

    expect(updatedUser.name).toBe('John Smith');
    expect(updatedUser.role).toBe('manager');
    expect(updatedUser.email).toBe(userData.email);
  });

  it('should throw error when updating non-existent user', async () => {
    await expect(
      repository.update('non-existent-id', { name: 'John Smith' })
    ).rejects.toThrow('User not found');
  });

  it('should delete user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const createdUser = await repository.create(userData);
    await repository.delete(createdUser.id);

    const foundUser = await repository.findById(createdUser.id);
    expect(foundUser).toBeNull();
  });

  it('should throw error when deleting non-existent user', async () => {
    await expect(
      repository.delete('non-existent-id')
    ).rejects.toThrow('User not found');
  });

  it('should check if user exists by id', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const createdUser = await repository.create(userData);

    expect(await repository.exists(createdUser.id)).toBe(true);
    expect(await repository.exists('non-existent-id')).toBe(false);
  });

  it('should check if user exists by email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    await repository.create(userData);

    expect(await repository.existsByEmail('john@example.com')).toBe(true);
    expect(await repository.existsByEmail('non-existent@example.com')).toBe(false);
  });

  it('should return all users', async () => {
    const userData1 = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    };

    const userData2 = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'admin' as const
    };

    await repository.create(userData1);
    await repository.create(userData2);

    const allUsers = await repository.findAll();
    expect(allUsers).toHaveLength(2);
    expect(allUsers.map(u => u.email)).toContain('john@example.com');
    expect(allUsers.map(u => u.email)).toContain('jane@example.com');
  });
});