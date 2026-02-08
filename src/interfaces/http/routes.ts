import { Router } from 'express';
import { z } from 'zod';
import { authz } from './middlewares/authz.js';
import type { User } from '../../domain/entities/User.js';
import { AuthorizationError } from '../../application/use-cases/GetGreeting.js';

const greetingQuerySchema = z.object({
  userId: z.string().optional()
});

export const router = Router();

router.get('/greeting', authz('greeting:read'), async (req, res) => {
  const container = req.app.get('container');
  const getGreeting = container.resolve('getGreeting');

  const parsed = greetingQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query' });
    return;
  }

  const actor = req.actor as User;
  const resource: User = {
    id: parsed.data.userId ?? actor.id,
    name: actor.name,
    role: actor.role,
    active: actor.active
  };

  try {
    const result = await getGreeting.execute({
      actor,
      resource,
      context: { ip: req.ip, isOwnerRoute: true }
    });

    res.json(result);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(500).json({ error: 'Unexpected error' });
  }
});
