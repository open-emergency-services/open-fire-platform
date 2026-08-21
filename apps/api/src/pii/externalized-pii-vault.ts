import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PiiRef, PiiVault } from './pii-vault';

/**
 * Externalized PII vault (the default; ADR-0007). PII lives in a SEPARATE store —
 * standing in here for a dedicated HIPAA-compliant database/host. A real deployment
 * points this at that separate server (its own encryption, access controls, audit,
 * and BAA). The event log holds only the token; erasing a subject deletes their rows
 * here, so the log stays immutable and the personal data is gone.
 */
@Injectable()
export class ExternalizedPiiVault extends PiiVault {
  readonly strategy = 'externalized';
  /** token → { subjectId, pii }. In production this is the separate HIPAA store. */
  private readonly store = new Map<string, { subjectId: string; pii: Record<string, unknown> }>();

  async put(subjectId: string, pii: Record<string, unknown>): Promise<PiiRef> {
    const ref = randomUUID();
    this.store.set(ref, { subjectId, pii });
    return ref;
  }

  async get(ref: PiiRef): Promise<Record<string, unknown> | null> {
    return this.store.get(ref)?.pii ?? null;
  }

  async erase(subjectId: string): Promise<void> {
    for (const [ref, rec] of this.store) {
      if (rec.subjectId === subjectId) this.store.delete(ref);
    }
  }
}
