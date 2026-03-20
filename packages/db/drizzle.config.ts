import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadFromRoot } from '@extasy/env';
import { defineConfig } from 'drizzle-kit';

loadFromRoot({
  fileName: '.env',
  startDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '..'),
});

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
