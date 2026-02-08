import type { Role, Permission, RBACContext } from '../../shared/types/RBAC.ts';
import { auditLogger } from '../security/logger.ts';
import { ForbiddenError } from '../../shared/errors/ApplicationError.ts';

export class RBACService {
  private rolePermissions = new Map<Role, Permission[]>([
    ['admin', ['*']],
    ['manager', ['users:read', 'users:write', 'users:delete', 'reports:read']],
    ['user', ['users:read:own', 'profile:write:own']],
    ['guest', ['users:read:public']]
  ]);

  public hasPermission(role: Role, permission: string, resource?: any): boolean {
    const permissions = this.rolePermissions.get(role) || [];
    
    if (permissions.includes('*')) {
      return true;
    }
    
    if (permissions.includes(permission)) {
      return true;
    }
    
    return permissions.some(perm => 
      this.matchesPattern(perm, permission, resource)
    );
  }

  public authorize(context: RBACContext, requiredPermission: string): void {
    const { user, resource, action, environment } = context;
    
    const hasPermission = this.hasPermission(
      user.role, 
      requiredPermission,
      resource
    );

    const auditData = {
      userId: user.id,
      userRole: user.role,
      action,
      resourceType: resource.type,
      resourceId: resource.id,
      requiredPermission,
      environment: {
        ip: environment.ip,
        userAgent: environment.userAgent,
        timestamp: environment.timestamp
      },
      decision: hasPermission ? 'ALLOWED' : 'DENIED',
      reason: hasPermission ? 'Permission granted' : 'Insufficient permissions'
    };

    if (hasPermission) {
      auditLogger.info('RBAC authorization successful', auditData);
    } else {
      auditLogger.warn('RBAC authorization denied', auditData);
      throw new ForbiddenError(`Access denied. Required permission: ${requiredPermission}`);
    }
  }

  private matchesPattern(pattern: string, permission: string, resource?: any): boolean {
    const patternParts = pattern.split(':');
    const permissionParts = permission.split(':');
    
    return patternParts.every((part, index) => 
      part === '*' || 
      part === permissionParts[index] || 
      (part === 'own' && resource && this.isOwner(resource, permissionParts[index]))
    );
  }

  private isOwner(resource: any, context: string): boolean {
    if (!resource || !resource.attributes) {
      return false;
    }
    
    return resource.attributes.ownerId === context;
  }
}