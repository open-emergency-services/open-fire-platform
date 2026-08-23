import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Dependency-light HS256 JWT sign/verify (node `crypto` only). Real signed tokens with an
 * expiry — no external IdP required to run the scaffold. Swap for RS256 + a JWKS from the
 * department's OIDC provider (Keycloak) in production; the verifier seam stays the same.
 */
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlJson(obj: unknown): string {
  return b64url(JSON.stringify(obj));
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export interface JwtClaims {
  sub: string; // userId
  dept: string; // departmentId
  roles: string[];
  entity?: string;
  iat: number;
  exp: number;
}

export interface JwtInput {
  sub: string;
  dept: string;
  roles: string[];
  entity?: string;
}

export function signJwt(claims: JwtInput, secret: string, ttlSeconds: number, nowMs: number): string {
  const iat = Math.floor(nowMs / 1000);
  const payload: JwtClaims = { ...claims, iat, exp: iat + ttlSeconds };
  const head = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlJson(payload);
  const sig = b64url(createHmac('sha256', secret).update(`${head}.${body}`).digest());
  return `${head}.${body}.${sig}`;
}

/** Verify signature + expiry. Returns claims or null. `nowMs` is injected (no ambient clock). */
export function verifyJwt(token: string, secret: string, nowMs: number): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expected = b64url(createHmac('sha256', secret).update(`${head}.${body}`).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let claims: JwtClaims;
  try {
    claims = JSON.parse(fromB64url(body).toString('utf8'));
  } catch {
    return null;
  }
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= nowMs) return null; // expired
  return claims;
}
