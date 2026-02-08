export interface PolicyContext {
  user: {
    id: string;
    role: string;
    department?: string;
    clearanceLevel?: number;
    attributes: Record<string, any>;
  };
  resource: {
    type: string;
    id: string;
    owner?: string;
    department?: string;
    classification?: string;
    attributes: Record<string, any>;
  };
  action: string;
  environment: {
    time: Date;
    ip: string;
    location?: string;
    device?: string;
  };
}

export interface PolicyRule {
  name: string;
  effect: 'Permit' | 'Deny';
  condition: (context: PolicyContext) => boolean;
  priority?: number;
}

export interface PolicyEvaluation {
  allowed: boolean;
  reason?: string;
  appliedPolicies: string[];
}