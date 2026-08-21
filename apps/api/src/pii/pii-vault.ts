/**
 * PII vault (ADR-0007) — keeps personal data OUT of the immutable event log so the
 * log stays append-only while personal data remains lawfully erasable (CJIS/HIPAA/GDPR).
 *
 * The rule: a module never writes PII (names, DOB, SSN, patient data) into an event's
 * `raw`/`normalized`. It `put()s` the PII in the vault, gets back an opaque **token**,
 * and stores only that token in the log. To display, `get()` resolves the token. To
 * satisfy a right-to-erasure, `erase(subjectId)` removes the PII — the token remains in
 * the log (so the audit structure is intact) but now resolves to `null`.
 *
 * Two interchangeable strategies (config-driven, see PiiModule):
 *  - **externalized** — PII lives in a separate (HIPAA-compliant) store/host; erase deletes it.
 *  - **crypto-shred** — PII stored encrypted per-subject; erase destroys the key.
 */
export type PiiRef = string;

export abstract class PiiVault {
  /** The active strategy name (for observability). */
  abstract readonly strategy: string;
  /** Store PII for a subject; returns an opaque token to keep in the log. */
  abstract put(subjectId: string, pii: Record<string, unknown>): Promise<PiiRef>;
  /** Resolve a token to its PII, or null if erased/unknown. */
  abstract get(ref: PiiRef): Promise<Record<string, unknown> | null>;
  /** Erase all PII for a subject (right-to-erasure). Tokens survive but resolve to null. */
  abstract erase(subjectId: string): Promise<void>;
}
