import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  type InteractionDefinitions,
  mergeInteractionDefinitions,
} from '../interactions/import-interactions';

type LoadDirOptions = {
  dir: string;
  extensions?: string[];
  ignore?: (filePath: string) => boolean;
};

export type LoadInteractionsFromDirOptions = LoadDirOptions;

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

const pickDefs = <TDeps>(
  mod: unknown,
): InteractionDefinitions<TDeps> | null => {
  if (!isObject(mod)) return null;

  // default export is the preferred convention
  const d = mod.default;
  if (isObject(d)) {
    return d as InteractionDefinitions<TDeps>;
  }

  const named = mod.interactions;
  if (isObject(named)) {
    return named as InteractionDefinitions<TDeps>;
  }

  // fallback: treat module exports as partial definitions
  const keys = [
    'commands',
    'contextMenus',
    'buttons',
    'modals',
    'stringSelects',
    'userSelects',
    'roleSelects',
    'channelSelects',
    'mentionableSelects',
    'continuityButtons',
    'continuitySelects',
  ] as const;

  const out: InteractionDefinitions<TDeps> = {};
  let found = false;

  for (const key of keys) {
    if (key in mod) {
      out[key] = (mod as any)[key];
      found = true;
    }
  }

  return found ? out : null;
};

export const loadInteractionDefinitionsFromDir = async <TDeps>(
  opts: LoadInteractionsFromDirOptions,
): Promise<InteractionDefinitions<TDeps>> => {
  const extensions = opts.extensions ?? defaultExtensions;
  const files = await collectFiles(opts.dir, {
    extensions,
    ignore: opts.ignore,
  });

  files.sort();

  const defs: InteractionDefinitions<TDeps>[] = [];

  for (const filePath of files) {
    const url = pathToFileURL(filePath).href;

    let mod: unknown;
    try {
      mod = await import(url);
    } catch (e) {
      throw new Error(`[core] Failed to import ${filePath}: ${String(e)}`);
    }

    const picked = pickDefs<TDeps>(mod);
    if (picked) {
      defs.push(picked);
    }
  }

  return mergeInteractionDefinitions(...defs);
};
