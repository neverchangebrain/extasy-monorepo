import { parseEnv } from '@extasy/env';
import Redis from 'ioredis';
import { z } from 'zod';

export const env = parseEnv(
  z.object({
    REDIS_URL: z.url(),
  }),
);

export const redis = new Redis(env.REDIS_URL);
