import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../.env'),
});

const envSchema = z.object({
  REDIS_URL: z.url(),
});

export const env = envSchema.parse(process.env);
