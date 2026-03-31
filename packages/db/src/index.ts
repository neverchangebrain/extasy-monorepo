import { parseEnv, z } from "@extasy/env";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const env = parseEnv(
  z.object({
    DATABASE_URL: z.url(),
  }),
);

export const db = drizzle(env.DATABASE_URL, { schema });
export * from "./schema";
export * from "drizzle-orm";
