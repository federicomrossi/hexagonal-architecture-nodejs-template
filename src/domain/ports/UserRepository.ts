import type { User } from '../entities/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
}
