import { parseEnv } from '@extasy/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { z } from 'zod';

import * as schema from './schemas';

const env = parseEnv(
  z.object({
    DATABASE_URL: z.url(),
  }),
);

export const db = drizzle(env.DATABASE_URL, { schema });
