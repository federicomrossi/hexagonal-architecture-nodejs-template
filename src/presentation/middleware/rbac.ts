import type { Request, Response, NextFunction } from 'express';
import type { RBACContext } from '../../shared/types/RBAC.ts';
import { RBACService } from '../security/RBACService.ts';
import { auditLogger } from '../security/logger.ts';

export const rbacMiddleware = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const rbacService = new RBACService();
      const user = (req as any).user;

      if (!user) {
        const auditData = {
          userId: 'anonymous',
          action: 'access_attempt',
          resourceType: req.path,
          requiredPermission,
          environment: {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          },
          decision: 'DENIED',
          reason: 'No authentication provided'
        };

        auditLogger.warn('RBAC authorization denied - no user', auditData);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const context: RBACContext = {
        user: {
          id: user.id,
          role: user.role,
          permissions: user.permissions || [],
          attributes: user.attributes
        },
        resource: {
          type: req.path.split('/')[1] || 'unknown',
          id: req.params.id,
          attributes: {
            ...req.params,
            ...req.query
          }
        },
        action: this.getActionFromMethod(req.method),
        environment: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        }
      };

      rbacService.authorize(context, requiredPermission);
      
      (req as any).rbacContext = context;
      next();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: error.message 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Authorization check failed'
      });
    }
  };
};

function getActionFromMethod(method: string): string {
  const methodActionMap: Record<string, string> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  
  return methodActionMap[method] || 'unknown';
}