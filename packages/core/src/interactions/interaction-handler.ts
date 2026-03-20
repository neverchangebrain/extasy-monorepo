import {
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Interaction,
  type MessageContextMenuCommandInteraction,
  MessageFlags,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
} from 'discord.js';

import { decodeContinuityToken } from './continuity';
import { getInteractionInfo } from './interaction-logger';
import type {
  ContextMenuModule,
  ContinuityModule,
  GenericButtonModule,
  InteractionDefinitions,
  InteractionInfo,
  InteractionLogger,
  ModalModule,
  SlashCommandModule,
  StringSelectModule,
} from './types';

export type CreateInteractionHandlerOptions<TDeps> = {
  deps: TDeps;
  interactions: InteractionDefinitions<TDeps>;
  logger?: InteractionLogger;
  onError?: (params: {
    interaction: Interaction;
    info: InteractionInfo;
    error: unknown;
  }) => void | Promise<void>;
};

export const createInteractionHandler = <TDeps>(
  opts: CreateInteractionHandlerOptions<TDeps>,
) => {
  const deps = opts.deps;
  const defs = opts.interactions;
  const logger = opts.logger;

  const commandMap = new Map<string, SlashCommandModule<TDeps>>(
    (defs.commands ?? []).map((m) => [m.data.name, m]),
  );

  const contextMenuMap = new Map<string, ContextMenuModule<TDeps>>(
    (defs.contextMenus ?? []).map((m) => [m.data.name, m]),
  );

  const buttons = defs.buttons ?? [];
  const modals = defs.modals ?? [];
  const stringSelects = defs.stringSelects ?? [];
  const userSelects = defs.userSelects ?? [];
  const roleSelects = defs.roleSelects ?? [];
  const channelSelects = defs.channelSelects ?? [];
  const mentionableSelects = defs.mentionableSelects ?? [];

  const continuityButtons = defs.continuityButtons ?? [];
  const continuitySelects = defs.continuitySelects ?? [];

  return async (interaction: Interaction) => {
    const startedAt = performance.now();
    const info = getInteractionInfo(interaction);

    try {
      if (interaction.isChatInputCommand()) {
        await handleChatInput(interaction, deps, commandMap);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction, deps, commandMap);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isUserContextMenuCommand()) {
        await handleUserContextMenu(interaction, deps, contextMenuMap);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isMessageContextMenuCommand()) {
        await handleMessageContextMenu(interaction, deps, contextMenuMap);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isButton()) {
        await handleButton(interaction, deps, buttons, continuityButtons);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isModalSubmit()) {
        await handleModal(interaction, deps, modals);
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        await handleStringSelect(
          interaction,
          deps,
          stringSelects,
          continuitySelects,
        );
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isUserSelectMenu()) {
        await handleByPrefix(interaction.customId, userSelects, {
          deps,
          interaction,
        });
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isRoleSelectMenu()) {
        await handleByPrefix(interaction.customId, roleSelects, {
          deps,
          interaction,
        });
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isChannelSelectMenu()) {
        await handleByPrefix(interaction.customId, channelSelects, {
          deps,
          interaction,
        });
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      if (interaction.isMentionableSelectMenu()) {
        await handleByPrefix(interaction.customId, mentionableSelects, {
          deps,
          interaction,
        });
        await log(logger, interaction, info, startedAt, true);
        return;
      }

      await log(logger, interaction, info, startedAt, true);
    } catch (error) {
      await log(logger, interaction, info, startedAt, false, error);

      if (opts.onError) {
        await opts.onError({ interaction, info, error });
      } else {
        await safeReplyError(interaction);
      }
    }
  };
};

const handleChatInput = async <TDeps>(
  interaction: ChatInputCommandInteraction,
  deps: TDeps,
  map: Map<string, SlashCommandModule<TDeps>>,
) => {
  const module = map.get(interaction.commandName);
  if (!module) return;

  await module.handler({ deps, interaction });
};

const handleAutocomplete = async <TDeps>(
  interaction: AutocompleteInteraction,
  deps: TDeps,
  map: Map<string, SlashCommandModule<TDeps>>,
) => {
  const module = map.get(interaction.commandName);
  if (!module?.autocomplete) return;

  await module.autocomplete({ deps, interaction });
};

const handleUserContextMenu = async <TDeps>(
  interaction: UserContextMenuCommandInteraction,
  deps: TDeps,
  map: Map<string, ContextMenuModule<TDeps>>,
) => {
  const module = map.get(interaction.commandName);
  if (!module?.userHandler) return;

  await module.userHandler({ deps, interaction });
};

const handleMessageContextMenu = async <TDeps>(
  interaction: MessageContextMenuCommandInteraction,
  deps: TDeps,
  map: Map<string, ContextMenuModule<TDeps>>,
) => {
  const module = map.get(interaction.commandName);
  if (!module?.messageHandler) return;

  await module.messageHandler({ deps, interaction });
};

const handleButton = async <TDeps>(
  interaction: ButtonInteraction,
  deps: TDeps,
  generic: GenericButtonModule<TDeps>[],
  continuity: ContinuityModule<TDeps, ButtonInteraction, any>[],
) => {
  const token = decodeContinuityToken(interaction.customId);
  if (token) {
    const module = continuity.find((m) => m.name === token.name);
    if (module) {
      const data = await module.getContext(token.id, deps);
      await module.handler({ deps, interaction, data, token });
      return;
    }
  }

  await handleByPrefix(interaction.customId, generic, { deps, interaction });
};

const handleModal = async <TDeps>(
  interaction: ModalSubmitInteraction,
  deps: TDeps,
  modals: ModalModule<TDeps>[],
) => {
  await handleByPrefix(interaction.customId, modals, { deps, interaction });
};

const handleStringSelect = async <TDeps>(
  interaction: StringSelectMenuInteraction,
  deps: TDeps,
  generic: StringSelectModule<TDeps>[],
  continuity: ContinuityModule<TDeps, StringSelectMenuInteraction, any>[],
) => {
  const token = decodeContinuityToken(interaction.customId);
  if (token) {
    const module = continuity.find((m) => m.name === token.name);
    if (module) {
      const data = await module.getContext(token.id, deps);
      await module.handler({ deps, interaction, data, token });
      return;
    }
  }

  await handleByPrefix(interaction.customId, generic, { deps, interaction });
};

const handleByPrefix = async <
  TContext extends { interaction: { customId: string } },
>(
  customId: string,
  modules: Array<{ customIdPrefix: string; handler: (ctx: any) => any }>,
  ctx: TContext,
) => {
  const module = modules.find((m) => customId.startsWith(m.customIdPrefix));
  if (!module) return;

  await module.handler(ctx);
};

const safeReplyError = async (interaction: Interaction) => {
  if (!interaction.isRepliable()) return;

  try {
    const content = 'Произошла ошибка при обработке интеракции.';

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content, flags: [MessageFlags.Ephemeral] });
    } else {
      await interaction.reply({ content, flags: [MessageFlags.Ephemeral] });
    }
  } catch {
    // ignore
  }
};

const log = async (
  logger: InteractionLogger | undefined,
  interaction: Interaction,
  info: InteractionInfo,
  startedAt: number,
  ok: boolean,
  error?: unknown,
) => {
  if (!logger) return;

  const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
  await logger({ interaction, info, durationMs, ok, error });
};
