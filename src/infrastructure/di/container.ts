import { createContainer, asClass, asValue } from 'awilix';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository.js';
import { GetGreeting } from '../../application/use-cases/GetGreeting.js';
import type { User } from '../../domain/entities/User.js';

const seedUsers: User[] = [
  { id: '1', name: 'Ada', role: 'admin', active: true },
  { id: '2', name: 'Linus', role: 'user', active: true }
];

export const buildContainer = () => {
  const container = createContainer();

  container.register({
    userRepository: asClass(InMemoryUserRepository).inject(() => ({ seed: seedUsers })),
    seedUsers: asValue(seedUsers),
    getGreeting: asClass(GetGreeting)
  });

  return container;
};
