import { Global, Module } from '@nestjs/common';
import { PiiVault } from './pii-vault';
import { ExternalizedPiiVault } from './externalized-pii-vault';
import { CryptoShredPiiVault } from './crypto-shred-pii-vault';

/**
 * PII vault (ADR-0007), config-driven and global. Both strategies are first-class:
 *   PII_STRATEGY=externalized  (default) — separate HIPAA-compliant store
 *   PII_STRATEGY=crypto-shred            — encrypted per-subject, erase by key destroy
 * Any module holding personal data injects PiiVault and stores only tokens in the log.
 */
@Global()
@Module({
  providers: [
    {
      provide: PiiVault,
      useFactory: (): PiiVault =>
        process.env.PII_STRATEGY === 'crypto-shred' ? new CryptoShredPiiVault() : new ExternalizedPiiVault(),
    },
  ],
  exports: [PiiVault],
})
export class PiiModule {}
