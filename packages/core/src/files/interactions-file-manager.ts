import { Collection } from 'discord.js';

import * as fs from 'fs';
import path from 'path';

import { getFilePaths } from '../constants/files';
import {
  ChatInputCommandHandler,
  ContextMenuMessageCommandHandler,
  GenericButtonInteractionHandler,
} from '../interactions';
import { BaseContinuity } from '../interactions/continuity/base';

type CommandHandler =
  | ChatInputCommandHandler
  | ContextMenuMessageCommandHandler
  | GenericButtonInteractionHandler
  | BaseContinuity<any>
  | BaseContinuity<any>;

type CommandHandlerClass =
  | typeof ChatInputCommandHandler
  | typeof ContextMenuMessageCommandHandler
  | typeof GenericButtonInteractionHandler
  | typeof BaseContinuity<any>
  | typeof BaseContinuity<any>;

export class InteractionsFileManager {
  static getFilesFromDirectory(directory: string): string[] {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.ts'))
      .map((file) => path.join(directory, file));
  }

  static async getCommandsFromDirectory<T extends CommandHandler>(
    directory: string,
    commandHandler: CommandHandlerClass,
  ): Promise<Collection<string, T>> {
    const commands = new Collection<string, T>();

    for (const file of this.getFilesFromDirectory(directory)) {
      const command = await import(file);

      if (!(command.default instanceof commandHandler)) continue;

      commands.set(command.default.metadata.name, command.default as T);
    }

    return commands;
  }

  // chat input commands
  static async getChatInputCommands(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<ChatInputCommandHandler>(
      FILE_PATH.CHAT_INPUT_COMMANDS,
      ChatInputCommandHandler,
    );
  }

  // context menu message commands
  static async getContextMenuMessageCommands(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<ContextMenuMessageCommandHandler>(
      FILE_PATH.CONTEXT_MENU_MESSAGE_COMMANDS,
      ContextMenuMessageCommandHandler,
    );
  }

  // button interactions
  static async getGenericButtonInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<GenericButtonInteractionHandler>(
      FILE_PATH.GENERIC_BUTTON_INTERACTIONS,
      GenericButtonInteractionHandler,
    );
  }

  static async getButtonInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(FILE_PATH.BUTTON_INTERACTIONS, BaseContinuity);
  }

  static async getStringSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(
      FILE_PATH.STRING_SELECT_MENU_INTERACTIONS,
      BaseContinuity,
    );
  }

  static async getUserSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(FILE_PATH.USER_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getRoleSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(FILE_PATH.ROLE_SELECT_MENU_INTERACTIONS, BaseContinuity);
  }

  static async getChannelSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(
      FILE_PATH.CHANNEL_SELECT_MENU_INTERACTIONS,
      BaseContinuity,
    );
  }

  static async getMentionableSelectMenuInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(
      FILE_PATH.MENTIONABLE_SELECT_MENU_INTERACTIONS,
      BaseContinuity,
    );
  }

  // modal interactions
  static async getModalInteractions(interactionsDir?: string) {
    const FILE_PATH = getFilePaths(interactionsDir);

    return this.getCommandsFromDirectory<BaseContinuity<any>>(FILE_PATH.MODAL_INTERACTIONS, BaseContinuity);
  }
}
