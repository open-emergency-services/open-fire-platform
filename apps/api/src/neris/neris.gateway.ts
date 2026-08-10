import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from '../config';

/**
 * NERIS integration gateway.
 *
 * Every outbound call to the federal NERIS API terminates here: OAuth2
 * client_credentials token management, validate-before-submit, create, and
 * list. Retry/idempotency live in the caller (IncidentsService) keyed on
 * incident_internal_id.
 *
 * PRODUCTION NOTE: prefer the official, MIT-licensed client
 * `@ulfsri/neris-nodejs-client` (createNerisClient), which code-generates
 * request/response types from the live OpenAPI spec. It is published to GitHub
 * Packages, so it needs an .npmrc registry line. This gateway is a dependency-
 * light stand-in that speaks the same OAuth + endpoints so the scaffold runs
 * out of the box; swap the fetch calls for the typed client when you wire real
 * submission. Endpoint paths below follow the documented client method names
 * (create_incident / validate_incident / list_incidents) — confirm exact routes
 * against https://api.neris.fsri.org/v1/docs.
 */
@Injectable()
export class NerisGateway {
  private readonly log = new Logger(NerisGateway.name);
  private token?: { access: string; expiresAt: number };

  private get cfg() {
    return getConfig().neris;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) {
      return this.token.access;
    }
    const res = await fetch(`${this.cfg.baseUrl}/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.cfg.clientId,
        client_secret: this.cfg.clientSecret,
      }),
    });
    if (!res.ok) throw new Error(`NERIS token request failed: ${res.status}`);
    const json: any = await res.json();
    this.token = {
      access: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
    return this.token.access;
  }

  private async call(method: string, path: string, body?: unknown) {
    if (!this.cfg.enabled) {
      this.log.warn(`NERIS disabled (no credentials) — simulating ${method} ${path}`);
      return { simulated: true };
    }
    const res = await fetch(`${this.cfg.baseUrl}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${await this.accessToken()}`,
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = (json as any)?.detail ?? res.statusText;
      throw new NerisApiError(res.status, detail, json);
    }
    return json;
  }

  /** Server-side validation without committing the record. */
  validateIncident(entityId: string, body: unknown) {
    return this.call('POST', `/entity/${entityId}/incident/validate`, body);
  }

  /** Submit an incident on behalf of the entity. */
  createIncident(entityId: string, body: unknown) {
    return this.call('POST', `/entity/${entityId}/incident`, body);
  }

  listIncidents(entityId: string) {
    return this.call('GET', `/incident?neris_id_entity=${encodeURIComponent(entityId)}`);
  }
}

export class NerisApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = 'NerisApiError';
  }
}
