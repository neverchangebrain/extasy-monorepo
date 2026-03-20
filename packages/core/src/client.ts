import { Collection, Client as DiscordClient } from 'discord.js';

import type {
  ChatInputCommandHandler,
  ContextMenuMessageCommandHandler,
  GenericButtonInteractionHandler,
} from './interactions';
import type { BaseContinuity } from './interactions/continuity/base';

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
  buttonInteractions: Collection<string, BaseContinuity<any>>;
  selectMenuInteractions: Collection<string, BaseContinuity<any>>;
}
