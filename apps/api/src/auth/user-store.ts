import { Injectable, Logger } from '@nestjs/common';
import { Principal, Role } from './principal';
import { hashPassword, verifyPassword } from './password';

interface StoredUser {
  userId: string;
  username: string;
  passwordHash: string;
  departmentId: string;
  roles: Role[];
  entityId?: string;
}

/**
 * The built-in user directory for username/password login — the fallback when a department
 * doesn't run SSO. In-memory + seeded here; a real deployment backs this with a database (the
 * class is the seam). Departments that DO run SSO won't use this at all — their users live in
 * Authentik/Keycloak and never touch this store.
 *
 * Seed via AUTH_SEED_USERS="user:pass:DEPT:role1|role2;user2:...". Absent → dev defaults
 * (with a loud warning), so the login page works out of the box.
 */
@Injectable()
export class UserStore {
  private readonly log = new Logger('UserStore');
  private readonly users = new Map<string, StoredUser>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const raw = process.env.AUTH_SEED_USERS;
    const rows: string[][] = raw
      ? raw.split(';').map((r) => r.split(':')).filter((r) => r.length >= 3)
      : [
          ['chief', 'chief123', 'DEMO_DEPT', 'admin'],
          ['officer', 'officer123', 'DEMO_DEPT', 'officer'],
          ['ff', 'ff123', 'DEMO_DEPT', 'responder'],
        ];
    for (const [username, password, departmentId, rolesStr] of rows) {
      const roles = (rolesStr ?? 'responder').split('|').filter(Boolean) as Role[];
      this.users.set(username, {
        userId: username,
        username,
        passwordHash: hashPassword(password),
        departmentId,
        roles: roles.length ? roles : ['responder'],
      });
    }
    if (!raw) {
      this.log.warn(
        `Seeded ${this.users.size} DEV users (chief/officer/ff — insecure defaults). ` +
          `Set AUTH_SEED_USERS or wire SSO before any real use.`,
      );
    }
  }

  /** Verify credentials → the principal fields, or null. */
  verify(username: string, password: string): Omit<Principal, 'anonymous'> | null {
    const u = this.users.get(username);
    if (!u || !verifyPassword(password, u.passwordHash)) return null;
    return { userId: u.userId, departmentId: u.departmentId, roles: u.roles, entityId: u.entityId };
  }
}
