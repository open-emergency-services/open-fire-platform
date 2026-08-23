/** Minimal env-backed config. Real deployments load from a secret store. */
export interface AppConfig {
  port: number;
  neris: {
    enabled: boolean;
    baseUrl: string;
    clientId: string;
    clientSecret: string;
  };
  auth: {
    /** HS256 signing secret for the built-in token issuer/verifier. */
    secret: string;
    /** When true, requests without a valid token are 401'd. When false (dev default),
     *  an unauthenticated request falls back to a permissive DEMO principal so the
     *  scaffold + screens run out of the box. */
    required: boolean;
    /** Allow the `/auth/dev-token` minting endpoint (dev only). */
    devTokens: boolean;
    /** Department + roles for the permissive dev fallback principal. */
    devDepartmentId: string;
    /**
     * External OIDC provider (SSO). When enabled, tokens issued by the department's own
     * identity provider — Authentik, Keycloak, Zitadel, any OIDC-compliant IdP — are
     * accepted alongside built-in tokens. We validate; we do NOT run the IdP. All optional
     * so the platform works with zero SSO configured (built-in password login is the fallback).
     */
    oidc: {
      enabled: boolean;
      issuer: string; // e.g. https://auth.dept.gov/application/o/open-fire/
      jwksUri: string; // the IdP's JWKS endpoint (from its .well-known/openid-configuration)
      audience: string; // expected `aud` (our client id), optional
      deptClaim: string; // which claim carries the department id
      rolesClaim: string; // which claim carries roles/groups
    };
  };
}

export function getConfig(): AppConfig {
  const clientId = process.env.NERIS_CLIENT_ID ?? '';
  const clientSecret = process.env.NERIS_CLIENT_SECRET ?? '';
  const authRequired = process.env.AUTH_REQUIRED === '1' || process.env.AUTH_REQUIRED === 'true';
  return {
    port: Number(process.env.PORT ?? 3000),
    neris: {
      // When creds are absent the gateway simulates calls so the app still runs.
      enabled: Boolean(clientId && clientSecret),
      baseUrl: process.env.NERIS_BASE_URL ?? 'https://api-test.neris.fsri.org/v1',
      clientId,
      clientSecret,
    },
    auth: {
      secret: process.env.AUTH_SECRET ?? 'ofp-dev-insecure-secret-change-me',
      required: authRequired,
      // Minting is on by default in dev; AUTH_DEV_TOKENS=1 force-enables it (e.g. to exercise
      // enforcement locally), AUTH_DEV_TOKENS=0 disables it. Off by default once auth is required.
      devTokens: process.env.AUTH_DEV_TOKENS === '1' || (process.env.AUTH_DEV_TOKENS !== '0' && !authRequired),
      devDepartmentId: process.env.AUTH_DEV_DEPT ?? 'DEMO_DEPT',
      oidc: {
        enabled: Boolean(process.env.OIDC_ISSUER && process.env.OIDC_JWKS_URI),
        issuer: process.env.OIDC_ISSUER ?? '',
        jwksUri: process.env.OIDC_JWKS_URI ?? '',
        audience: process.env.OIDC_AUDIENCE ?? '',
        deptClaim: process.env.OIDC_DEPT_CLAIM ?? 'department',
        rolesClaim: process.env.OIDC_ROLES_CLAIM ?? 'roles',
      },
    },
  };
}
