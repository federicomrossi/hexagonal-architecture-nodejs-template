import type { PolicyRule, PolicyContext, PolicyEvaluation } from '../../shared/types/ABAC.ts';
import { ForbiddenError } from '../../shared/errors/ApplicationError.ts';

export class PolicyEngine {
  private policies: PolicyRule[] = [];

  public addPolicy(policy: PolicyRule): void {
    this.policies.push(policy);
    this.policies.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  public removePolicy(name: string): void {
    this.policies = this.policies.filter(policy => policy.name !== name);
  }

  public clearPolicies(): void {
    this.policies = [];
  }

  public evaluate(context: PolicyContext): PolicyEvaluation {
    const appliedPolicies: string[] = [];
    let decision = false;
    let reason = 'No applicable policy found';

    for (const policy of this.policies) {
      if (policy.condition(context)) {
        appliedPolicies.push(policy.name);
        
        if (policy.effect === 'Deny') {
          return {
            allowed: false,
            reason: `Denied by policy: ${policy.name}`,
            appliedPolicies
          };
        }
        
        decision = true;
        reason = `Permitted by policy: ${policy.name}`;
      }
    }

    return {
      allowed: decision,
      reason: decision ? reason : 'Access denied by default',
      appliedPolicies
    };
  }

  public authorize(context: PolicyContext): void {
    const evaluation = this.evaluate(context);
    
    if (!evaluation.allowed) {
      throw new ForbiddenError(evaluation.reason || 'Access denied');
    }
  }

  public static createDefaultPolicies(): PolicyRule[] {
    return [
      {
        name: 'owner-full-access',
        effect: 'Permit',
        priority: 100,
        condition: (ctx) => ctx.user.id === ctx.resource.owner
      },
      {
        name: 'admin-full-access',
        effect: 'Permit',
        priority: 90,
        condition: (ctx) => ctx.user.role === 'admin'
      },
      {
        name: 'same-department-read',
        effect: 'Permit',
        priority: 50,
        condition: (ctx) => 
          ctx.action === 'read' && 
          ctx.user.department === ctx.resource.department
      },
      {
        name: 'business-hours-only',
        effect: 'Deny',
        priority: 30,
        condition: (ctx) => {
          const hour = ctx.environment.time.getHours();
          return hour < 9 || hour > 17;
        }
      },
      {
        name: 'self-user-management',
        effect: 'Permit',
        priority: 80,
        condition: (ctx) => 
          ctx.resource.type === 'user' && 
          ctx.action === 'update' && 
          ctx.user.id === ctx.resource.id
      }
    ];
  }
}