import { parseEnv, z } from '@extasy/env';
import Redis from 'ioredis';

export const env = parseEnv(
  z.object({
    REDIS_URL: z.url(),
  }),
);

export const redis = new Redis(env.REDIS_URL);
