import { Collection } from "discord.js";

import * as fs from "node:fs";
import path from "node:path";

import { getFilePaths } from "../constants/files";
import {
  ChatInputCommandHandler,
  ContextMenuMessageCommandHandler,
  GenericButtonInteractionHandler,
} from "../interactions";
import { BaseContinuity } from "../interactions/continuity/base";

type InteractionHandler =
  | ChatInputCommandHandler
  | ContextMenuMessageCommandHandler
  | GenericButtonInteractionHandler
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  | BaseContinuity<any>;

type InteractionHandlerClass =
  | typeof ChatInputCommandHandler
  | typeof ContextMenuMessageCommandHandler
  | typeof GenericButtonInteractionHandler
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  | typeof BaseContinuity<any>;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InteractionsFileManager {
  static getFilesFromDirectory(directory: string): string[] {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => path.join(directory, file));
  }

  static async getInteractionsFromDirectory<T extends InteractionHandler>(
    directory: string,
    interactionHandler: InteractionHandlerClass,
  ): Promise<Collection<string, T>> {
    const interactions = new Collection<string, T>();

    for (const file of InteractionsFileManager.getFilesFromDirectory(
      directory,
    )) {
      const interaction = await import(file);

      if (!(interaction.default instanceof interactionHandler)) continue;

      interactions.set(
        interaction.default.metadata.name,
        interaction.default as T,
      );
    }

    return interactions;
  }

  // chat input commands
  static async getChatInputCommands(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<ChatInputCommandHandler>(
      FILE_PATH.CHAT_INPUT_COMMANDS,
      ChatInputCommandHandler,
    );
  }

  // context menu message commands
  static async getContextMenuMessageCommands(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<ContextMenuMessageCommandHandler>(
      FILE_PATH.CONTEXT_MENU_MESSAGE_COMMANDS,
      ContextMenuMessageCommandHandler,
    );
  }

  // button interactions
  static async getGenericButtonInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<GenericButtonInteractionHandler>(
      FILE_PATH.GENERIC_BUTTON_INTERACTIONS,
      GenericButtonInteractionHandler,
    );
  }

  static async getButtonInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.BUTTON_INTERACTIONS, BaseContinuity);
  }

  static async getStringSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.STRING_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getUserSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.USER_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getRoleSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.ROLE_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getChannelSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.CHANNEL_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getMentionableSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.MENTIONABLE_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  // modal interactions
  static async getModalInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return InteractionsFileManager.getInteractionsFromDirectory<
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      BaseContinuity<any>
    >(FILE_PATH.MODAL_INTERACTIONS, BaseContinuity);
  }
}
