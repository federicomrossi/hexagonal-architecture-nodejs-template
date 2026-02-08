import type { Request, Response, NextFunction } from 'express';
import { can } from '../../../domain/policies/rbac.js';
import { canAccess } from '../../../domain/policies/abac.js';
import type { User } from '../../../domain/entities/User.js';

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const buildActor = (req: Request): User => {
  return {
    id: req.header('x-user-id') ?? '1',
    name: req.header('x-user-name') ?? 'Ada',
    role: (req.header('x-user-role') as User['role']) ?? 'admin',
    active: toBoolean(req.header('x-user-active'), true)
  };
};

export const authz = (permission: string) => (req: Request, res: Response, next: NextFunction) => {
  const actor = buildActor(req);
  const resource: User = actor;
  const context = { ip: req.ip, isOwnerRoute: true };

  const rbacAllowed = can(actor.role, permission);
  const abacAllowed = canAccess(actor, resource, context);

  if (!rbacAllowed || !abacAllowed) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  req.actor = actor;
  next();
};
