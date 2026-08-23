import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { UserStore } from './user-store';
import { OidcVerifier } from './oidc-verifier';

/**
 * Authentication + authorization (ADR-0010). Registers two global guards: AuthGuard resolves
 * the Principal from a bearer token (or the permissive dev fallback), and RolesGuard enforces
 * `@Roles(...)`. `@Global` so any module can inject AuthService.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserStore,
    OidcVerifier,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
