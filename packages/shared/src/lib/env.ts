import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  GUILD_ID: z.string().min(17),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
