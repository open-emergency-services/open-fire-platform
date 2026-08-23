import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators';
import { hasRole, Principal, Role } from './principal';

/**
 * Enforces `@Roles(...)` on a route against the authenticated Principal. Runs after the
 * AuthGuard (which set `req.principal`). `admin` satisfies any requirement.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required || required.length === 0) return true;
    const principal = ctx.switchToHttp().getRequest().principal as Principal | undefined;
    if (!principal || !required.some((r) => hasRole(principal, r))) {
      throw new ForbiddenException(`Requires role: ${required.join(' or ')}`);
    }
    return true;
  }
}
