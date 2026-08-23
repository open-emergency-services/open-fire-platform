import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC } from './decorators';

/**
 * Global authentication guard. Resolves the caller's Principal from a bearer token
 * (`Authorization: Bearer …`, or `?access_token=` for EventSource which can't set headers)
 * and attaches it to the request. When auth is not required (dev), an unauthenticated
 * request gets the permissive dev principal instead of a 401 — so the scaffold runs without
 * tokens, while the exact same code path enforces them once AUTH_REQUIRED=1.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const token = extractToken(req);
    const now = Date.now();

    if (token) {
      const principal = await this.auth.verify(token, now);
      if (principal) {
        req.principal = principal;
        return true;
      }
      // A token was presented but is invalid/expired — always reject, even in dev.
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (this.auth.required) {
      throw new UnauthorizedException('Authentication required');
    }
    req.principal = this.auth.devFallback();
    return true;
  }
}

function extractToken(req: any): string | undefined {
  const header: string | undefined = req.headers?.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7).trim();
  // EventSource can't set headers — allow a query token for the SSE route.
  const q = req.query?.access_token;
  if (typeof q === 'string' && q) return q;
  return undefined;
}
