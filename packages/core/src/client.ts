import { Collection, Client as DiscordClient } from 'discord.js';

import type {
  ChatInputCommandHandler,
  ContextMenuMessageCommandHandler,
  GenericButtonInteractionHandler,
} from './interactions';
import type { BaseContinuity } from './interactions/continuity/base';

export interface CoreClient extends DiscordClient {
  chatInputCommands: Collection<string, ChatInputCommandHandler>;
  contextMenuMessageCommands: Collection<string, ContextMenuMessageCommandHandler>;
  genericButtonInteractions: Collection<string, GenericButtonInteractionHandler>;
  buttonInteractions: Collection<string, BaseContinuity<any>>;
  // typed select menu interactions (./select-menu/<type>)
  stringSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  userSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  roleSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  channelSelectMenuInteractions: Collection<string, BaseContinuity<any>>;
  mentionableSelectMenuInteractions: Collection<string, BaseContinuity<any>>;

  // modal interactions (./modals)
  modalInteractions: Collection<string, BaseContinuity<any>>;
}
