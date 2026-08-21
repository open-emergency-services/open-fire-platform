import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { PiiVault } from './pii-vault';
import { ExternalizedPiiVault } from './externalized-pii-vault';
import { CryptoShredPiiVault } from './crypto-shred-pii-vault';

/** Both strategies must satisfy the same contract (ADR-0007). */
const strategies: Array<[string, () => PiiVault]> = [
  ['externalized', () => new ExternalizedPiiVault()],
  ['crypto-shred', () => new CryptoShredPiiVault()],
];

describe.each(strategies)('PiiVault (%s)', (_name, make) => {
  it('stores PII and resolves the token back to it', async () => {
    const v = make();
    const ref = await v.put('subject-1', { name: 'J. Rivera', dob: '1990-04-02' });
    expect(typeof ref).toBe('string');
    expect(await v.get(ref)).toEqual({ name: 'J. Rivera', dob: '1990-04-02' });
  });

  it('returns null for an unknown token', async () => {
    const v = make();
    expect(await v.get('nope')).toBeNull();
  });

  it('erase() makes the subject unresolvable while the token still exists (log intact)', async () => {
    const v = make();
    const ref = await v.put('subject-2', { name: 'A. Person', ssn: '000-00-0000' });
    expect(await v.get(ref)).not.toBeNull();
    await v.erase('subject-2');
    // The token (which lives in the immutable log) is unchanged, but resolves to nothing.
    expect(await v.get(ref)).toBeNull();
  });

  it('erase() is scoped to the subject — other subjects are unaffected', async () => {
    const v = make();
    const a = await v.put('A', { name: 'Alpha' });
    const b = await v.put('B', { name: 'Bravo' });
    await v.erase('A');
    expect(await v.get(a)).toBeNull();
    expect(await v.get(b)).toEqual({ name: 'Bravo' });
  });
});

describe('crypto-shred specifics', () => {
  it('keeps ciphertext after erase but it is permanently unrecoverable', async () => {
    const v = new CryptoShredPiiVault();
    const ref = await v.put('S', { patient: 'confidential' });
    await v.erase('S'); // destroys the key
    // record still present internally, but no key → unreadable forever
    expect(await v.get(ref)).toBeNull();
  });
});
