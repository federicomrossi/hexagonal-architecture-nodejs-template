export type Role = 'admin' | 'manager' | 'user' | 'guest';
export type Permission = string;
export type Resource = string;

export interface UserRole {
  userId: string;
  role: Role;
  permissions: Permission[];
  attributes?: Record<string, any>;
}

export interface RBACContext {
  user: {
    id: string;
    role: Role;
    permissions: Permission[];
    attributes?: Record<string, any>;
  };
  resource: {
    type: string;
    id?: string;
    attributes?: Record<string, any>;
  };
  action: string;
  environment: {
    ip: string;
    userAgent?: string;
    timestamp: Date;
  };
}