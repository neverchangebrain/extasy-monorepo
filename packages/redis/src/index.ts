import 'dotenv/config';
import Redis from 'ioredis';
import { z } from 'zod';

const redisEnvSchema = z.object({
  REDIS_URL: z.string().url().optional(),
});

export type RedisClient = Redis | null;

export function createRedis(): RedisClient {
  const env = redisEnvSchema.parse(process.env);

  if (!env.REDIS_URL) {
    return null;
  }

  return new Redis(env.REDIS_URL);
}
