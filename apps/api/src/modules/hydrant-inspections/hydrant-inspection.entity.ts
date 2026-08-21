import { NerisHydrantInspection } from '@ofp/neris-schema';

/**
 * A hydrant inspection read-model record. `data` is the NERIS-shaped payload
 * (typed against the generated `NerisHydrantInspection`); `Partial` because a form
 * may not fill every field, and capture-everything (ADR-0006) keeps the rest in `raw`.
 */
export interface HydrantInspectionRecord {
  id: string;
  data: Partial<NerisHydrantInspection>;
  createdAt: string;
}
