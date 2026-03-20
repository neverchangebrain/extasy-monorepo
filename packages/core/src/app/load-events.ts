import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { AnyEventModule } from '../events/types';

type LoadDirOptions = {
  dir: string;
  extensions?: string[];
  ignore?: (filePath: string) => boolean;
};

export type LoadEventsFromDirOptions = LoadDirOptions;

const defaultExtensions = ['.ts', '.js', '.mjs', '.cjs'];

const collectFiles = async (
  dir: string,
  opts: Required<Pick<LoadDirOptions, 'extensions'>> &
    Pick<LoadDirOptions, 'ignore'>,
): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (opts.ignore?.(full)) {
      continue;
    }

    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full, opts)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.endsWith('.d.ts')) {
      continue;
    }

    const ext = path.extname(entry.name);
    if (!opts.extensions.includes(ext)) {
      continue;
    }

    out.push(full);
  }

  return out;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const isEventModule = <TDeps>(v: unknown): v is AnyEventModule<TDeps> => {
  return (
    isObject(v) &&
    typeof (v as any).event === 'string' &&
    typeof (v as any).handler === 'function'
  );
};

const pickEvents = <TDeps>(mod: unknown): AnyEventModule<TDeps>[] => {
  if (!isObject(mod)) return [];

  const d = mod.default;
  if (Array.isArray(d)) {
    return d.filter((x) => isEventModule<TDeps>(x));
  }
  if (isEventModule<TDeps>(d)) {
    return [d];
  }

  const named = mod.events;
  if (Array.isArray(named)) {
    return named.filter((x) => isEventModule<TDeps>(x));
  }
  if (isEventModule<TDeps>(named)) {
    return [named];
  }

  return [];
};

export const loadEventModulesFromDir = async <TDeps>(
  opts: LoadEventsFromDirOptions,
): Promise<AnyEventModule<TDeps>[]> => {
  const extensions = opts.extensions ?? defaultExtensions;
  const files = await collectFiles(opts.dir, {
    extensions,
    ignore: opts.ignore,
  });

  files.sort();

  const events: AnyEventModule<TDeps>[] = [];

  for (const filePath of files) {
    const url = pathToFileURL(filePath).href;

    let mod: unknown;
    try {
      mod = await import(url);
    } catch (e) {
      throw new Error(`[core] Failed to import ${filePath}: ${String(e)}`);
    }

    events.push(...pickEvents<TDeps>(mod));
  }

  return events;
};
