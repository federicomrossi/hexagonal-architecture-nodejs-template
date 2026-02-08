import type { IUserRepository } from '../../domain/repositories/IUserRepository.ts';
import type { UserEntity, CreateUserData, UpdateUserData } from '../../domain/entities/UserEntity.ts';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = UserEntity.create(data);
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    const updatedUser = user.update(data);
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    this.users.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  public clear(): void {
    this.users.clear();
  }

  public seed(users: UserEntity[]): void {
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }
}