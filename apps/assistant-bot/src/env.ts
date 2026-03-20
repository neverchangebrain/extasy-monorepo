import { z } from '@extasy/env';
import { parseEnv } from '@extasy/env';

export const env = parseEnv(
  z.object({
    ASSISTANT_BOT_TOKEN: z.string(),
    ASSISTANT_BOT_ID: z.string(),
  }),
);
