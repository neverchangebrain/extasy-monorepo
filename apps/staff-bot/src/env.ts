import { parseEnv, z } from "@extasy/env";

export const env = parseEnv(
  z.object({
    STAFF_BOT_TOKEN: z.string(),
    STAFF_BOT_ID: z.string(),
  }),
);
