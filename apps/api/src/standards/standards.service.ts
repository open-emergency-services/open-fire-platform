import { BadRequestException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventStore } from '../core/event-store';
import {
  DEFAULT_TIMER_STANDARDS,
  TIMER_STANDARD_KEYS,
  TimerStandards,
} from './timer-standards';

const SET_TYPE = 'standards.timers.set';

/** What the API hands the command board: the platform defaults, this department's
 *  override (only the fields it changed), and the effective merge the board should use. */
export interface TimerStandardsView {
  defaults: TimerStandards;
  override: Partial<TimerStandards>;
  effective: TimerStandards;
  departmentId: string;
}

/**
 * Server-delivered, per-department timer standards (replaces the command board's
 * hardcoded table). Overrides are event-sourced in the Core log — durable across
 * restart and rebuilt on boot like every other read model, no extra infrastructure.
 * Read is open to any authenticated member; changing the department's standards is
 * officer-gated (that happens in the controller).
 */
@Injectable()
export class StandardsService implements OnApplicationBootstrap {
  /** departmentId -> the fields that department has overridden. */
  private readonly overrides = new Map<string, Partial<TimerStandards>>();

  constructor(private readonly store: EventStore) {}

  async onApplicationBootstrap(): Promise<void> {
    this.overrides.clear();
    for (const e of await this.store.all()) this.apply(e.source_type, e.normalized);
  }

  private apply(type: string, payload: Record<string, unknown> | undefined): void {
    if (type !== SET_TYPE || !payload) return;
    const dept = String(payload.departmentId ?? '');
    const patch = (payload.override ?? {}) as Partial<TimerStandards>;
    if (!dept) return;
    const current = this.overrides.get(dept) ?? {};
    // A field set back to its default is dropped from the override, so `override`
    // always reflects exactly what still differs from the platform default.
    for (const [k, v] of Object.entries(patch) as [keyof TimerStandards, number][]) {
      if (v === DEFAULT_TIMER_STANDARDS[k]) delete current[k];
      else current[k] = v;
    }
    this.overrides.set(dept, current);
  }

  get(departmentId: string): TimerStandardsView {
    const override = this.overrides.get(departmentId) ?? {};
    return {
      defaults: DEFAULT_TIMER_STANDARDS,
      override,
      effective: { ...DEFAULT_TIMER_STANDARDS, ...override },
      departmentId,
    };
  }

  /** Validate + apply a partial override for a department, appending it to the log. */
  async setDept(
    departmentId: string,
    patch: Record<string, unknown>,
    actor?: string,
  ): Promise<TimerStandardsView> {
    if (!departmentId) throw new BadRequestException('departmentId required');
    const clean = this.validate(patch);
    const { event } = await this.store.append({
      event_id: randomUUID(),
      source: 'ui',
      source_type: SET_TYPE,
      raw: { departmentId, override: clean, actor: actor ?? null },
      normalized: { departmentId, override: clean },
      correlation: { department_id: departmentId },
    });
    this.apply(event.source_type, event.normalized);
    return this.get(departmentId);
  }

  private validate(patch: Record<string, unknown>): Partial<TimerStandards> {
    if (!patch || typeof patch !== 'object') throw new BadRequestException('override must be an object');
    const out: Partial<TimerStandards> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (!TIMER_STANDARD_KEYS.includes(k as keyof TimerStandards)) {
        throw new BadRequestException(`unknown standard: ${k}`);
      }
      if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v > 600) {
        throw new BadRequestException(`${k} must be a number of minutes in (0, 600]`);
      }
      out[k as keyof TimerStandards] = v;
    }
    if (Object.keys(out).length === 0) throw new BadRequestException('override is empty');
    return out;
  }
}
