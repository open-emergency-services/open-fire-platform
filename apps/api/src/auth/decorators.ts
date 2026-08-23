import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Principal, Role } from './principal';

/** Mark a route (or controller) as public — the auth guard lets it through unauthenticated. */
export const IS_PUBLIC = 'ofp:isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Require one of these roles (enforced by RolesGuard). `admin` always satisfies. */
export const ROLES_KEY = 'ofp:roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Inject the authenticated Principal into a handler parameter. */
export const CurrentPrincipal = createParamDecorator((_data: unknown, ctx: ExecutionContext): Principal => {
  const req = ctx.switchToHttp().getRequest();
  return req.principal as Principal;
});
