import { UserEntity } from '../../../src/domain/entities/UserEntity.ts';

describe('UserEntity', () => {
  it('should create user with valid data', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const,
      department: 'engineering'
    };

    const user = UserEntity.create(userData);

    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.department).toBe(userData.department);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create user with default role when not provided', () => {
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com'
    };

    const user = UserEntity.create(userData);

    expect(user.role).toBe('user');
  });

  it('should throw error for invalid email format', () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email'
    };

    expect(() => UserEntity.create(userData)).toThrow('Invalid email format');
  });

  it('should throw error for name shorter than 2 characters', () => {
    const userData = {
      name: 'J',
      email: 'john@example.com'
    };

    expect(() => UserEntity.create(userData)).toThrow('Name must be at least 2 characters long');
  });

  it('should update user correctly', () => {
    const user = UserEntity.create({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });

    const updatedUser = user.update({
      name: 'John Smith',
      role: 'manager'
    });

    expect(updatedUser.id).toBe(user.id);
    expect(updatedUser.name).toBe('John Smith');
    expect(updatedUser.email).toBe(user.email);
    expect(updatedUser.role).toBe('manager');
    expect(updatedUser.updatedAt).not.toBe(user.updatedAt);
  });

  it('should convert to JSON correctly', () => {
    const user = UserEntity.create({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });

    const json = user.toJSON();

    expect(json).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  });
});