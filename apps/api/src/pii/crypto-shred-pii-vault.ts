import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { PiiRef, PiiVault } from './pii-vault';

/**
 * Crypto-shredding PII vault (the alternative; ADR-0007). PII is stored ENCRYPTED with a
 * per-subject key (AES-256-GCM). To satisfy erasure, destroy the subject's key — the
 * ciphertext remains but is permanently unrecoverable ("shredded"). The event log holds
 * only the token; no plaintext PII is ever in it.
 *
 * Wave-0 keeps keys in memory; a real deployment holds them in a KMS/HSM so a key destroy
 * is authoritative and audited.
 */
@Injectable()
export class CryptoShredPiiVault extends PiiVault {
  readonly strategy = 'crypto-shred';
  /** subjectId → 256-bit key. Destroying the key shreds all that subject's PII. */
  private readonly keys = new Map<string, Buffer>();
  /** token → encrypted record. */
  private readonly store = new Map<string, { subjectId: string; iv: Buffer; tag: Buffer; ct: Buffer }>();

  private keyFor(subjectId: string): Buffer {
    let k = this.keys.get(subjectId);
    if (!k) { k = randomBytes(32); this.keys.set(subjectId, k); }
    return k;
  }

  async put(subjectId: string, pii: Record<string, unknown>): Promise<PiiRef> {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.keyFor(subjectId), iv);
    const ct = Buffer.concat([cipher.update(JSON.stringify(pii), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const ref = randomUUID();
    this.store.set(ref, { subjectId, iv, tag, ct });
    return ref;
  }

  async get(ref: PiiRef): Promise<Record<string, unknown> | null> {
    const r = this.store.get(ref);
    if (!r) return null;
    const key = this.keys.get(r.subjectId);
    if (!key) return null; // key shredded → unrecoverable
    const d = createDecipheriv('aes-256-gcm', key, r.iv);
    d.setAuthTag(r.tag);
    const pt = Buffer.concat([d.update(r.ct), d.final()]);
    return JSON.parse(pt.toString('utf8'));
  }

  async erase(subjectId: string): Promise<void> {
    this.keys.delete(subjectId); // shred the key; ciphertext is now permanently unreadable
  }
}
