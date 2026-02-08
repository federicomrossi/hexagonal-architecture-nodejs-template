import type { User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/ports/UserRepository.js';
import { can } from '../../domain/policies/rbac.js';
import { canAccess, type AccessContext } from '../../domain/policies/abac.js';

export class AuthorizationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export interface GetGreetingInput {
  actor: User;
  resource: User;
  context: AccessContext;
}

export class GetGreeting {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ actor, resource, context }: GetGreetingInput): Promise<{ message: string }> {
    const resolvedResource = (await this.userRepository.findById(resource.id)) ?? resource;

    const rbacAllowed = can(actor.role, 'greeting:read');
    const abacAllowed = canAccess(actor, resolvedResource, context);

    if (!rbacAllowed || !abacAllowed) {
      throw new AuthorizationError();
    }

    return { message: `Hola, ${resolvedResource.name}` };
  }
}
