/**
 * The authenticated caller. In production this is derived from an OIDC/JWT issued by the
 * department's IdP (Keycloak); in the scaffold it comes from a signed dev token. Either
 * way the rest of the code depends only on this shape (ADR-0001: swappable auth behind a
 * stable seam), never on how it was obtained.
 */
export type Role = 'responder' | 'officer' | 'admin';

export interface Principal {
  userId: string;
  departmentId: string;
  roles: Role[];
  /** NERIS entity id this user submits under, when known. */
  entityId?: string;
  /** True when this is the permissive dev fallback (no real token was presented). */
  anonymous?: boolean;
}

// Roles are hierarchical: admin ⊇ officer ⊇ responder. Holding a higher role satisfies a
// requirement for a lower one (an officer can do anything a responder can).
const RANK: Record<Role, number> = { responder: 1, officer: 2, admin: 3 };

export function hasRole(p: Principal, role: Role): boolean {
  const need = RANK[role];
  return p.roles.some((r) => (RANK[r] ?? 0) >= need);
}
