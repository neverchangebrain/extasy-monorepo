import type { Collection, Client as DiscordClient } from "discord.js";

import type {
  ChatInputCommandHandler,
  ContextMenuMessageCommandHandler,
  GenericButtonInteractionHandler,
} from "./interactions";
import type { BaseContinuity } from "./interactions/continuity/base";

export interface CoreClient extends DiscordClient {
  chatInputCommands: Collection<string, ChatInputCommandHandler>;
  contextMenuMessageCommands: Collection<
    string,
    ContextMenuMessageCommandHandler
  >;
  genericButtonInteractions: Collection<
    string,
    GenericButtonInteractionHandler
  >;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  buttonInteractions: Collection<string, BaseContinuity<any>>;
  // typed select menu interactions
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  stringSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  userSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  roleSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  channelSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  mentionableSelectMenuInteractions: Collection<string, BaseContinuity<any>>;

  // modal interactions
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  modalInteractions: Collection<string, BaseContinuity<any>>;
}
