import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/errors/ApplicationError.ts';
import { auditLogger } from '../security/logger.ts';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  attributes?: Record<string, any>;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const auditData = {
        userId: 'anonymous',
        action: 'auth_attempt',
        resourceType: req.path,
        environment: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        },
        decision: 'DENIED',
        reason: 'No token provided'
      };

      auditLogger.warn('Authentication failed - no token', auditData);
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Access token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      attributes: decoded.attributes || {}
    };

    const auditData = {
      userId: decoded.id,
      action: 'auth_success',
      resourceType: req.path,
      environment: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      },
      decision: 'ALLOWED',
      reason: 'Valid token provided'
    };

    auditLogger.info('Authentication successful', auditData);
    next();
  } catch (error) {
    const auditData = {
      userId: 'anonymous',
      action: 'auth_attempt',
      resourceType: req.path,
      environment: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      },
      decision: 'DENIED',
      reason: error instanceof Error ? error.message : 'Invalid token'
    };

    auditLogger.warn('Authentication failed - invalid token', auditData);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};