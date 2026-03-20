import { parseEnv, z } from '@extasy/env';

export const env = parseEnv(
  z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    TEMP_DIR_PATH: z.string().default('./temp'),
  }),
);

export const isDevelopment = env.NODE_ENV === 'development';
