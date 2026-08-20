import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// Wave-0 test config. Aliases the workspace schema package to its generated
// source so `npm test` runs without a separate build step.
export default defineConfig({
  resolve: {
    alias: {
      '@ofp/neris-schema': resolve(__dirname, '../../packages/neris-schema/src/generated/index.ts'),
    },
  },
  test: { environment: 'node', include: ['src/**/*.spec.ts'] },
});
