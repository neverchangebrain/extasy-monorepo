import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDotenvFromRepoRoot, readRequiredEnv } from '@extasy/env';
import { defineConfig } from 'drizzle-kit';

loadDotenvFromRepoRoot({
  fileName: '.env',
  startDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '..'),
});

const databaseUrl = readRequiredEnv('DATABASE_URL');

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
