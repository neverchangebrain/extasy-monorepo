import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../.env'),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined. Expected it in the repo root .env (../../.env from packages/db).',
  );
}

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
