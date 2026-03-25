import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

type LoadResult =
  | { loaded: true; path: string }
  | { loaded: false; path: null };

type LoadOptions = {
  fileName?: string;
  startDir?: string;
  maxDepth?: number;
};

const findUp = (fileName: string, startDir = process.cwd(), maxDepth = 10) => {
  let dir = startDir;

  for (let depth = 0; depth <= maxDepth; depth++) {
    const candidate = path.join(dir, fileName);
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
};

export const loadFromRoot = (opts: LoadOptions = {}): LoadResult => {
  const fileName = opts.fileName ?? '.env';
  const startDir = opts.startDir ?? process.cwd();
  const maxDepth = opts.maxDepth ?? 10;

  const envPath = findUp(fileName, startDir, maxDepth);

  if (envPath) {
    dotenv.config({ path: envPath, quiet: true });
    return { loaded: true, path: envPath };
  }

  dotenv.config({ quiet: true });
  return { loaded: false, path: null };
};

export const parseEnv = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  opts: LoadOptions = {},
): z.infer<TSchema> => {
  loadFromRoot(opts);
  return schema.parse(process.env);
};

export { z };
