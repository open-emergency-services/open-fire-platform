-- Core append-only event log (ADR-0004 recording core + ADR-0006 capture-everything).
-- This table is the SOURCE OF TRUTH. It is append-only by policy: no UPDATE, no DELETE.
-- `raw` is the complete verbatim inbound (lossless); `normalized` is what we've mapped;
-- `unmapped` is the raw keys not yet mapped. Nothing inbound is ever dropped.

CREATE TABLE IF NOT EXISTS event_log (
  seq             BIGSERIAL PRIMARY KEY,          -- store cursor / ordering key
  event_id        TEXT        NOT NULL UNIQUE,     -- global idempotency key
  source          TEXT        NOT NULL,            -- 'open-p25-console' | 'cad' | 'ui' | ...
  source_type     TEXT        NOT NULL,            -- source's own event/record type
  schema_version  TEXT,                            -- source contract version
  session_id      TEXT,                            -- per-emitter run (stream sources)
  source_seq      BIGINT,                          -- source's own seq (e.g. radio seq)
  occurred_at     TIMESTAMPTZ,                     -- source-authoritative time
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw             JSONB       NOT NULL,            -- COMPLETE verbatim inbound (lossless)
  normalized      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  unmapped        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  content_ref     TEXT,                            -- blob pointer for binary payloads
  correlation     JSONB                            -- platform links, e.g. {"incident_id": "..."}
);

-- Projection / catch-up reads walk by seq; correlation lookups fetch an incident's events.
CREATE INDEX IF NOT EXISTS event_log_source_idx      ON event_log (source, source_type);
CREATE INDEX IF NOT EXISTS event_log_correlation_idx ON event_log USING GIN (correlation);
CREATE INDEX IF NOT EXISTS event_log_session_idx     ON event_log (session_id, source_seq);

-- Enforce append-only at the database (belt-and-suspenders; app never issues these anyway).
-- A TRIGGER is used rather than a RULE: rules on UPDATE/DELETE would block the INSERT
-- ... ON CONFLICT the append path relies on. The trigger raises on any UPDATE/DELETE.
CREATE OR REPLACE FUNCTION event_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'event_log is append-only: % is not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_log_no_mutate ON event_log;
CREATE TRIGGER event_log_no_mutate
  BEFORE UPDATE OR DELETE ON event_log
  FOR EACH ROW EXECUTE FUNCTION event_log_immutable();
