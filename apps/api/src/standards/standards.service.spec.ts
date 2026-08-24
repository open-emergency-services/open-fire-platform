import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventStore } from '../core/event-store';
import { StandardsService } from './standards.service';
import { DEFAULT_TIMER_STANDARDS } from './timer-standards';

describe('StandardsService (per-department timer standards)', () => {
  let store: InMemoryEventStore;
  let svc: StandardsService;
  beforeEach(() => {
    store = new InMemoryEventStore();
    svc = new StandardsService(store);
  });

  it('returns the platform defaults when a department has no override', () => {
    const v = svc.get('DEPT_A');
    expect(v.effective).toEqual(DEFAULT_TIMER_STANDARDS);
    expect(v.override).toEqual({});
  });

  it('applies a partial override on top of the defaults, per department', async () => {
    await svc.setDept('DEPT_A', { par: 8, airCrit: 18 }, 'chief');
    const a = svc.get('DEPT_A');
    expect(a.override).toEqual({ par: 8, airCrit: 18 });
    expect(a.effective.par).toBe(8);
    expect(a.effective.airCrit).toBe(18);
    expect(a.effective.rehab).toBe(DEFAULT_TIMER_STANDARDS.rehab); // untouched field keeps default
    // isolation: DEPT_B is unaffected
    expect(svc.get('DEPT_B').effective).toEqual(DEFAULT_TIMER_STANDARDS);
  });

  it('a field set back to its default drops out of the override', async () => {
    await svc.setDept('DEPT_A', { par: 8 }, 'chief');
    expect(svc.get('DEPT_A').override).toEqual({ par: 8 });
    await svc.setDept('DEPT_A', { par: DEFAULT_TIMER_STANDARDS.par }, 'chief');
    expect(svc.get('DEPT_A').override).toEqual({});
  });

  it('rejects unknown keys and out-of-range values', async () => {
    await expect(svc.setDept('DEPT_A', { nope: 5 }, 'chief')).rejects.toThrow(/unknown standard/i);
    await expect(svc.setDept('DEPT_A', { par: 0 }, 'chief')).rejects.toThrow(/minutes/i);
    await expect(svc.setDept('DEPT_A', { par: 'ten' as any }, 'chief')).rejects.toThrow(/minutes/i);
    await expect(svc.setDept('DEPT_A', {}, 'chief')).rejects.toThrow(/empty/i);
  });

  it('overrides are event-sourced — rebuilt from the log on boot', async () => {
    await svc.setDept('DEPT_A', { par: 8 }, 'chief');
    await svc.setDept('DEPT_A', { canReport: 5 }, 'chief');
    const fresh = new StandardsService(store);
    await fresh.onApplicationBootstrap();
    expect(fresh.get('DEPT_A').override).toEqual({ par: 8, canReport: 5 });
    expect(fresh.get('DEPT_A').effective.par).toBe(8);
  });
});
