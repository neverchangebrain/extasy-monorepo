import {
  ButtonBuilder,
  type ButtonComponentData,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  SharedSlashCommand,
} from 'discord.js';

import type { CoreClient } from '../client';

export class ChatInputCommandHandler {
  constructor(
    readonly metadata: SharedSlashCommand,
    readonly handler: (
      interaction: ChatInputCommandInteraction,
      client: CoreClient,
    ) => Promise<unknown>,
  ) {}
}

export class ContextMenuMessageCommandHandler {
  constructor(
    readonly metadata: ContextMenuCommandBuilder,
    readonly handler: (
      interaction: MessageContextMenuCommandInteraction,
      client: CoreClient,
    ) => Promise<unknown>,
  ) {}
}

export class GenericButtonInteractionHandler {
  constructor(
    readonly metadata: {
      name: string;
      getButton: (data?: Partial<ButtonComponentData>) => ButtonBuilder;
    },
    readonly handler: (
      interaction: ButtonInteraction,
      client: CoreClient,
    ) => Promise<unknown>,
  ) {}
}
