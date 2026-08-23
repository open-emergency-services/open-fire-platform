import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateKeyPairSync, createSign } from 'node:crypto';
import { Reflector } from '@nestjs/core';
import { signJwt, verifyJwt } from './jwt';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { UserStore } from './user-store';
import { OidcVerifier } from './oidc-verifier';
import { ROLES_KEY } from './decorators';

const SECRET = 'ofp-dev-insecure-secret-change-me';
const now = 1_800_000_000_000;
const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');

function ctxFor(req: any, handler: any = () => {}) {
  return { switchToHttp: () => ({ getRequest: () => req }), getHandler: () => handler, getClass: () => class {} } as any;
}
const newAuth = () => new AuthService(new UserStore(), new OidcVerifier());

describe('JWT (HS256)', () => {
  it('round-trips and rejects tampering + expiry', () => {
    const tok = signJwt({ sub: 'u1', dept: 'DEPT_A', roles: ['officer'] }, SECRET, 3600, now);
    expect(verifyJwt(tok, SECRET, now)?.dept).toBe('DEPT_A');
    expect(verifyJwt(tok, 'wrong', now)).toBeNull();
    expect(verifyJwt(tok + 'x', SECRET, now)).toBeNull();
    expect(verifyJwt(tok, SECRET, now + 3601_000)).toBeNull();
  });
});

describe('AuthService — tokens + password login', () => {
  const svc = newAuth();
  it('mints and verifies its own token', async () => {
    const tok = svc.mintDevToken({ userId: 'u2', departmentId: 'DEPT_B', roles: ['responder'] }, now);
    const p = await svc.verify(tok, now);
    expect(p?.departmentId).toBe('DEPT_B');
    expect(p?.roles).toEqual(['responder']);
  });

  it('logs in a seeded user with username/password → token', () => {
    const good = svc.login('officer', 'officer123', now); // dev seed
    expect(good?.principal.roles).toEqual(['officer']);
    expect(good?.token).toBeTruthy();
    expect(svc.login('officer', 'wrong', now)).toBeNull();
    expect(svc.login('nobody', 'x', now)).toBeNull();
  });
});

describe('AuthGuard (async)', () => {
  let auth: AuthService;
  let guard: AuthGuard;
  beforeEach(() => {
    auth = newAuth();
    guard = new AuthGuard(auth, new Reflector());
  });
  afterEach(() => { delete process.env.AUTH_REQUIRED; });

  it('permissive dev fallback when no token', async () => {
    const req: any = { headers: {}, query: {} };
    expect(await guard.canActivate(ctxFor(req))).toBe(true);
    expect(req.principal.anonymous).toBe(true);
  });
  it('attaches principal for a valid token', async () => {
    const tok = auth.mintDevToken({ userId: 'u', departmentId: 'DEPT_X', roles: ['officer'] }, Date.now());
    const req: any = { headers: { authorization: `Bearer ${tok}` }, query: {} };
    expect(await guard.canActivate(ctxFor(req))).toBe(true);
    expect(req.principal.departmentId).toBe('DEPT_X');
  });
  it('rejects an invalid token even in dev', async () => {
    const req: any = { headers: { authorization: 'Bearer not.a.jwt' }, query: {} };
    await expect(guard.canActivate(ctxFor(req))).rejects.toThrow();
  });
  it('requires a token when AUTH_REQUIRED=1', async () => {
    process.env.AUTH_REQUIRED = '1';
    await expect(guard.canActivate(ctxFor({ headers: {}, query: {} }))).rejects.toThrow(/required/i);
  });
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  const withRoles = (roles: string[], principalRoles: string[]) => {
    const handler = () => {};
    Reflect.defineMetadata(ROLES_KEY, roles, handler);
    return guard.canActivate(ctxFor({ principal: { userId: 'u', departmentId: 'D', roles: principalRoles } }, handler));
  };
  it('allows a matching role and admin, denies otherwise', () => {
    expect(withRoles(['officer'], ['officer'])).toBe(true);
    expect(withRoles(['officer'], ['admin'])).toBe(true);
    expect(() => withRoles(['officer'], ['responder'])).toThrow(/role/i);
  });
});

describe('OidcVerifier (external SSO plug, RS256/JWKS)', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const signRs256 = (payload: object) => {
    const head = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test' })).toString('base64url');
    const body = b64url(payload);
    const s = createSign('RSA-SHA256');
    s.update(`${head}.${body}`);
    return `${head}.${body}.${s.sign(privateKey).toString('base64url')}`;
  };
  beforeEach(() => {
    process.env.OIDC_ISSUER = 'https://idp.test';
    process.env.OIDC_JWKS_URI = 'https://idp.test/jwks';
    process.env.OIDC_DEPT_CLAIM = 'department';
    process.env.OIDC_ROLES_CLAIM = 'roles';
  });
  afterEach(() => {
    delete process.env.OIDC_ISSUER; delete process.env.OIDC_JWKS_URI;
    delete process.env.OIDC_DEPT_CLAIM; delete process.env.OIDC_ROLES_CLAIM;
  });

  it('accepts a valid IdP token and maps claims → principal', async () => {
    const oidc = new OidcVerifier({ resolve: async () => publicKey }); // injected key (no network)
    const tok = signRs256({ sub: 'sso-user', iss: 'https://idp.test', exp: Math.floor(now / 1000) + 3600, department: 'DEPT_SSO', roles: ['responder', 'officer'] });
    const p = await oidc.verify(tok, now);
    expect(p?.departmentId).toBe('DEPT_SSO');
    expect(p?.roles).toEqual(['responder', 'officer']);
  });

  it('rejects a wrong issuer and an expired token', async () => {
    const oidc = new OidcVerifier({ resolve: async () => publicKey });
    const badIss = signRs256({ sub: 'u', iss: 'https://evil.test', exp: Math.floor(now / 1000) + 3600, department: 'D' });
    const expired = signRs256({ sub: 'u', iss: 'https://idp.test', exp: Math.floor(now / 1000) - 10, department: 'D' });
    expect(await oidc.verify(badIss, now)).toBeNull();
    expect(await oidc.verify(expired, now)).toBeNull();
  });
});
