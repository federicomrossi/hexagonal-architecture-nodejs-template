import type { User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/ports/UserRepository.js';

interface InMemoryUserRepositoryDeps {
  seed?: User[];
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  constructor({ seed }: InMemoryUserRepositoryDeps = {}) {
    seed?.forEach((user) => this.users.set(user.id, user));
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
}
