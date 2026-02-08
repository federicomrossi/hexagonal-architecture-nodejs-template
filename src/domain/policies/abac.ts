import type { User } from '../entities/User.js';

export interface AccessContext {
  ip?: string;
  isOwnerRoute?: boolean;
}

export const canAccess = (actor: User, resource: User, context: AccessContext): boolean => {
  if (!actor.active || !resource.active) {
    return false;
  }

  const ownerOk = actor.id === resource.id;
  const adminOverride = actor.role === 'admin';
  const routeOk = context.isOwnerRoute ?? true;

  return routeOk && (ownerOk || adminOverride);
};
