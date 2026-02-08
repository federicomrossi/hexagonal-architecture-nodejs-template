import { GetGreeting, AuthorizationError } from '../../src/application/use-cases/GetGreeting.js';
import { InMemoryUserRepository } from '../../src/infrastructure/repositories/InMemoryUserRepository.js';
import type { User } from '../../src/domain/entities/User.js';

describe('GetGreeting', () => {
  const actor: User = { id: '1', name: 'Ada', role: 'admin', active: true };
  const resource: User = { id: '1', name: 'Ada', role: 'admin', active: true };

  it('returns greeting when authorized', async () => {
    const repository = new InMemoryUserRepository({ seed: [resource] });
    const useCase = new GetGreeting(repository);

    await expect(
      useCase.execute({ actor, resource, context: { ip: '127.0.0.1', isOwnerRoute: true } })
    ).resolves.toEqual({ message: 'Hola, Ada' });
  });

  it('throws when unauthorized', async () => {
    const blockedActor: User = { id: '2', name: 'Linus', role: 'user', active: false };
    const repository = new InMemoryUserRepository({ seed: [resource] });
    const useCase = new GetGreeting(repository);

    await expect(
      useCase.execute({
        actor: blockedActor,
        resource,
        context: { ip: '127.0.0.1', isOwnerRoute: true }
      })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
