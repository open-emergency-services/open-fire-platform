import { Injectable } from '@nestjs/common';
import { getConfig } from '../config';
import { Principal, Role } from './principal';
import { signJwt, verifyJwt, JwtClaims } from './jwt';
import { UserStore } from './user-store';
import { OidcVerifier } from './oidc-verifier';

/**
 * Resolves a bearer token to a Principal, issues tokens for the built-in username/password
 * login, and delegates to the OIDC verifier for external SSO. The verifier is a swappable
 * seam: a token is accepted if it's one of ours (HS256) OR issued by the department's OIDC
 * provider (Authentik/Keycloak/…). We never run the IdP.
 */
@Injectable()
export class AuthService {
  constructor(private readonly users: UserStore, private readonly oidc: OidcVerifier) {}

  private get cfg() {
    return getConfig().auth;
  }

  /** Verify a bearer token → Principal, or null. Tries our own token first, then external SSO. */
  async verify(token: string, nowMs: number): Promise<Principal | null> {
    const claims = verifyJwt(token, this.cfg.secret, nowMs);
    if (claims) return this.toPrincipal(claims);
    if (this.oidc.enabled) return this.oidc.verify(token, nowMs); // external OIDC (SSO)
    return null;
  }

  /** Built-in username/password login (the SSO fallback) → a signed token, or null. */
  login(username: string, password: string, nowMs: number): { token: string; principal: Principal } | null {
    const p = this.users.verify(username, password);
    if (!p) return null;
    const token = this.mintDevToken({ userId: p.userId, departmentId: p.departmentId, roles: p.roles, entityId: p.entityId }, nowMs);
    return { token, principal: { ...p } };
  }

  private toPrincipal(c: JwtClaims): Principal {
    const roles = (Array.isArray(c.roles) ? c.roles : []).filter((r): r is Role =>
      r === 'responder' || r === 'officer' || r === 'admin',
    );
    return { userId: c.sub, departmentId: c.dept, roles, entityId: typeof c.entity === 'string' ? c.entity : undefined };
  }

  /** The permissive dev fallback used when auth is not required and no token was presented. */
  devFallback(): Principal {
    return { userId: 'dev', departmentId: this.cfg.devDepartmentId, roles: ['admin'], anonymous: true };
  }

  get required(): boolean {
    return this.cfg.required;
  }
  get devTokensEnabled(): boolean {
    return this.cfg.devTokens;
  }

  /** Mint a dev token (only when enabled). `nowMs` injected — no ambient clock. */
  mintDevToken(input: { userId: string; departmentId: string; roles: Role[]; entityId?: string }, nowMs: number, ttlSeconds = 8 * 3600): string {
    return signJwt(
      { sub: input.userId, dept: input.departmentId, roles: input.roles, entity: input.entityId },
      this.cfg.secret,
      ttlSeconds,
      nowMs,
    );
  }
}
