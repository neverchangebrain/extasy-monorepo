import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export function createDb() {
  const env = dbEnvSchema.parse(process.env);
  const client = postgres(env.DATABASE_URL, { prepare: false });

  return drizzle({ client });
}
