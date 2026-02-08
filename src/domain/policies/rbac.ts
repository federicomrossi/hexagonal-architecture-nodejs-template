import type { UserRole } from '../entities/User.js';

const rolePermissions: Record<UserRole, Set<string>> = {
  admin: new Set(['greeting:read']),
  user: new Set(['greeting:read'])
};

export const can = (role: UserRole, permission: string): boolean => {
  return rolePermissions[role]?.has(permission) ?? false;
};
