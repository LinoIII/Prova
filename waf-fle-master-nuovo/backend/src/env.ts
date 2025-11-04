import 'dotenv/config';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env var ${name}`);
  }
  return v;
}

export const ENV = {
  PORT: parseInt(requireEnv('PORT'), 10),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  INGEST_API_KEY: requireEnv('INGEST_API_KEY')
};

