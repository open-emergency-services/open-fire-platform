import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ReadinessService } from './readiness.service';

describe('ReadinessService (LB drain)', () => {
  it('is ready until shutdown drains it', () => {
    const r = new ReadinessService();
    expect(r.isReady()).toBe(true);
    r.beforeApplicationShutdown();
    expect(r.isReady()).toBe(false);
  });

  it('can be drained manually', () => {
    const r = new ReadinessService();
    r.setDraining();
    expect(r.isReady()).toBe(false);
  });
});
