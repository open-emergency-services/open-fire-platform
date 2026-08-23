import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentPrincipal, Public } from './decorators';
import { Principal, Role } from './principal';

/**
 * Auth endpoints. `/auth/me` echoes the resolved principal (handy for the UI). `/auth/dev-token`
 * mints a signed dev token so screens/curl can authenticate without a real IdP — enabled only
 * in dev (disabled when AUTH_REQUIRED or AUTH_DEV_TOKENS=0). Production issues tokens from the
 * OIDC provider instead.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  me(@CurrentPrincipal() principal: Principal) {
    return principal;
  }

  /** Built-in username/password login (fallback when no SSO). Returns a signed bearer token. */
  @Public()
  @Post('login')
  login(@Body() body: { username?: string; password?: string }) {
    const result = this.auth.login(body.username ?? '', body.password ?? '', Date.now());
    if (!result) throw new UnauthorizedException('Invalid username or password');
    return { token: result.token, token_type: 'Bearer', principal: result.principal };
  }

  @Public()
  @Post('dev-token')
  devToken(@Body() body: { userId?: string; departmentId?: string; roles?: Role[]; entityId?: string }) {
    if (!this.auth.devTokensEnabled) {
      throw new BadRequestException('Dev token minting is disabled');
    }
    const token = this.auth.mintDevToken(
      {
        userId: body.userId || 'dev-user',
        departmentId: body.departmentId || 'DEMO_DEPT',
        roles: body.roles && body.roles.length ? body.roles : ['responder', 'officer'],
        entityId: body.entityId,
      },
      Date.now(),
    );
    return { token, token_type: 'Bearer' };
  }
}
