import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { NerisController } from './neris.controller';

describe('NerisController (incident-type reference data)', () => {
  it('serves the full active NERIS incident-type hierarchy with l1/l2/l3 + label', () => {
    const res = new NerisController().incidentTypes();
    expect(res.count).toBeGreaterThan(100); // the framework has 128 types
    expect(res.count).toBe(res.types.length);
    const t = res.types[0];
    expect(t).toHaveProperty('l1');
    expect(t).toHaveProperty('l2');
    expect(t).toHaveProperty('l3');
    expect(t).toHaveProperty('label');
    expect(res.types.every((x) => x.active)).toBe(true);
    // hierarchy is usable as a cascading picker: FIRE has multiple subtypes
    const fireL2 = new Set(res.types.filter((x) => x.l1 === 'FIRE').map((x) => x.l2));
    expect(fireL2.size).toBeGreaterThan(1);
  });
});
