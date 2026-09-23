import 'dotenv/config';

const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === '' ? fallback : ['1', 'true', 'yes'].includes(v.toLowerCase());

/**
 * CORS_ORIGIN: "*" allows any origin; a comma-separated list allows those; unset allows any
 * localhost port (the frontend may fall back off :3000).
 */
const rawCors = process.env.CORS_ORIGIN?.trim();
const corsOrigin: boolean | (string | RegExp)[] =
  rawCors === '*'
    ? true
    : rawCors
      ? rawCors.split(',').map((s) => s.trim())
      : [/^http:\/\/(localhost|127\.0\.0\.1):\d+$/];

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin,
  /** true (default): in-memory fixtures, no Docker. false: PostgresStore (stub today). */
  useMockData: bool(process.env.USE_MOCK_DATA, true),
  enableRedisAdapter: bool(process.env.ENABLE_REDIS_ADAPTER, false),
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6380',
  defaultTenantId: process.env.DEFAULT_TENANT_ID ?? 'tnt_baycrest',
} as const;
