/** Minimal env-backed config. Real deployments load from a secret store. */
export interface AppConfig {
  port: number;
  neris: {
    enabled: boolean;
    baseUrl: string;
    clientId: string;
    clientSecret: string;
  };
}

export function getConfig(): AppConfig {
  const clientId = process.env.NERIS_CLIENT_ID ?? '';
  const clientSecret = process.env.NERIS_CLIENT_SECRET ?? '';
  return {
    port: Number(process.env.PORT ?? 3000),
    neris: {
      // When creds are absent the gateway simulates calls so the app still runs.
      enabled: Boolean(clientId && clientSecret),
      baseUrl: process.env.NERIS_BASE_URL ?? 'https://api-test.neris.fsri.org/v1',
      clientId,
      clientSecret,
    },
  };
}
