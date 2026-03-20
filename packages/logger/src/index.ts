import { parseEnv, z } from '@extasy/env';
import { pino } from 'pino';

const env = parseEnv(
  z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),
  }),
);

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: './transport.ts',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
            singleLine: true,
            messageFormat: '{msg}',
          },
        }
      : undefined,
});
