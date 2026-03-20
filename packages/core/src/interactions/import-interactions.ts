import type { ContextMenuCommandBuilder, SharedSlashCommand } from 'discord.js';

import type {
  ComponentModule,
  ContextMenuModule,
  ContinuityModule,
  InteractionDefinitions,
  SlashCommandModule,
} from './types';

export type ApplicationCommandBuilder =
  | SharedSlashCommand
  | ContextMenuCommandBuilder;

export const getApplicationCommandBuilders = <TDeps>(
  defs: InteractionDefinitions<TDeps>,
): ApplicationCommandBuilder[] => {
  return [
    ...(defs.commands ?? []).map((m) => m.data),
    ...(defs.contextMenus ?? []).map((m) => m.data),
  ];
};

export const mergeInteractionDefinitions = <TDeps>(
  ...definitions: InteractionDefinitions<TDeps>[]
): InteractionDefinitions<TDeps> => {
  const merged: InteractionDefinitions<TDeps> = {
    commands: [],
    contextMenus: [],
    buttons: [],
    modals: [],
    stringSelects: [],
    userSelects: [],
    roleSelects: [],
    channelSelects: [],
    mentionableSelects: [],
    continuityButtons: [],
    continuitySelects: [],
  };

  for (const defs of definitions) {
    merged.commands!.push(...(defs.commands ?? []));
    merged.contextMenus!.push(...(defs.contextMenus ?? []));

    merged.buttons!.push(...(defs.buttons ?? []));
    merged.modals!.push(...(defs.modals ?? []));
    merged.stringSelects!.push(...(defs.stringSelects ?? []));
    merged.userSelects!.push(...(defs.userSelects ?? []));
    merged.roleSelects!.push(...(defs.roleSelects ?? []));
    merged.channelSelects!.push(...(defs.channelSelects ?? []));
    merged.mentionableSelects!.push(...(defs.mentionableSelects ?? []));

    merged.continuityButtons!.push(...(defs.continuityButtons ?? []));
    merged.continuitySelects!.push(...(defs.continuitySelects ?? []));
  }

  assertUnique('commands', merged.commands, (m) => m.data.name);
  assertUnique('contextMenus', merged.contextMenus, (m) => m.data.name);

  assertUnique('buttons', merged.buttons, (m) => m.customIdPrefix);
  assertUnique('modals', merged.modals, (m) => m.customIdPrefix);
  assertUnique('stringSelects', merged.stringSelects, (m) => m.customIdPrefix);
  assertUnique('userSelects', merged.userSelects, (m) => m.customIdPrefix);
  assertUnique('roleSelects', merged.roleSelects, (m) => m.customIdPrefix);
  assertUnique(
    'channelSelects',
    merged.channelSelects,
    (m) => m.customIdPrefix,
  );
  assertUnique(
    'mentionableSelects',
    merged.mentionableSelects,
    (m) => m.customIdPrefix,
  );

  assertUnique('continuityButtons', merged.continuityButtons, (m) => m.name);
  assertUnique('continuitySelects', merged.continuitySelects, (m) => m.name);

  return merged;
};

const assertUnique = <T>(
  label: string,
  items: T[] | undefined,
  getKey: (item: T) => string,
) => {
  if (!items || items.length === 0) return;

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    const key = getKey(item);

    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.size > 0) {
    throw new Error(
      `[core] Duplicate ${label}: ${Array.from(duplicates).join(', ')}`,
    );
  }
};

export type {
  InteractionDefinitions,
  SlashCommandModule,
  ContextMenuModule,
  ComponentModule,
  ContinuityModule,
};
