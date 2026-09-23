import type { NextFunction, Request, Response } from 'express';
import { config } from '../config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantId: string;
    }
  }
}

/**
 * Resolves the tenant for every request (spec §20).
 * DEMO: trusts the `x-tenant-id` header, falling back to the demo tenant.
 * HOOK(auth): replace with session/JWT → { tenantId, userId, role }. Never trust a
 * client-supplied tenant id in production.
 */
export function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('x-tenant-id');
  req.tenantId = header && header.trim() ? header.trim() : config.defaultTenantId;
  next();
}
