import { Injectable, Logger, Optional } from '@nestjs/common';
import { createPublicKey, createVerify, KeyObject } from 'node:crypto';
import { getConfig } from '../config';
import { Principal, Role } from './principal';

interface Jwk { kid: string; kty: string; n: string; e: string; alg?: string; use?: string; [k: string]: unknown; }

/** Fetches a JWKS and returns the public key for a given kid. Swappable for tests. */
export interface KeyResolver {
  resolve(kid: string): Promise<KeyObject | null>;
}

/**
 * External OIDC (SSO) token verifier — the plug for Authentik / Keycloak / Zitadel / any
 * OIDC-compliant identity provider. When configured (OIDC_ISSUER + OIDC_JWKS_URI), an RS256
 * token issued by the department's IdP is validated against its JWKS and mapped to a
 * Principal. We validate the token; the department runs and maintains the IdP. Disabled and
 * inert unless configured — the built-in password login remains the zero-config fallback.
 */
@Injectable()
export class OidcVerifier {
  private readonly log = new Logger('OidcVerifier');
  private keyCache = new Map<string, KeyObject>();
  private cacheAt = 0;

  /** Test seam: inject a KeyResolver to avoid network in unit tests. */
  constructor(@Optional() private readonly keyResolver?: KeyResolver) {}

  private get cfg() {
    return getConfig().auth.oidc;
  }

  get enabled(): boolean {
    return this.cfg.enabled;
  }

  async verify(token: string, nowMs: number): Promise<Principal | null> {
    if (!this.cfg.enabled) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let header: { alg?: string; kid?: string };
    let claims: Record<string, unknown>;
    try {
      header = JSON.parse(b64urlToBuf(parts[0]).toString('utf8'));
      claims = JSON.parse(b64urlToBuf(parts[1]).toString('utf8'));
    } catch {
      return null;
    }
    if (header.alg !== 'RS256' || !header.kid) return null;

    const key = await this.getKey(header.kid);
    if (!key) return null;

    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    const ok = verifier.verify(key, b64urlToBuf(parts[2]));
    if (!ok) return null;

    // Standard claim checks.
    if (this.cfg.issuer && claims.iss !== this.cfg.issuer) return null;
    if (typeof claims.exp !== 'number' || claims.exp * 1000 <= nowMs) return null;
    if (this.cfg.audience && !audienceMatches(claims.aud, this.cfg.audience)) return null;

    return this.toPrincipal(claims);
  }

  private toPrincipal(c: Record<string, unknown>): Principal {
    const dept = String(c[this.cfg.deptClaim] ?? '');
    const rawRoles = c[this.cfg.rolesClaim];
    const roles = (Array.isArray(rawRoles) ? rawRoles : typeof rawRoles === 'string' ? rawRoles.split(/[\s,]+/) : [])
      .map((r) => String(r).toLowerCase())
      .filter((r): r is Role => r === 'responder' || r === 'officer' || r === 'admin');
    return { userId: String(c.sub ?? 'oidc'), departmentId: dept, roles, entityId: typeof c.entity === 'string' ? c.entity : undefined };
  }

  private async getKey(kid: string): Promise<KeyObject | null> {
    if (this.keyResolver) return this.keyResolver.resolve(kid);
    // 10-minute cache of the IdP's signing keys.
    if (Date.now() - this.cacheAt > 600_000) this.keyCache.clear();
    if (this.keyCache.has(kid)) return this.keyCache.get(kid)!;
    try {
      const res = await fetch(this.cfg.jwksUri);
      if (!res.ok) throw new Error(`JWKS ${res.status}`);
      const { keys } = (await res.json()) as { keys: Jwk[] };
      this.cacheAt = Date.now();
      for (const jwk of keys) {
        try {
          this.keyCache.set(jwk.kid, createPublicKey({ key: jwk as any, format: 'jwk' }));
        } catch { /* skip non-RSA keys */ }
      }
      return this.keyCache.get(kid) ?? null;
    } catch (err: any) {
      this.log.warn(`JWKS fetch failed: ${err.message}`);
      return null;
    }
  }
}

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}
function audienceMatches(aud: unknown, expected: string): boolean {
  return Array.isArray(aud) ? aud.includes(expected) : aud === expected;
}
