import type {
  AutocompleteInteraction,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  Interaction,
  MentionableSelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  SharedSlashCommand,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction,
} from 'discord.js';

export type BaseContext<TDeps, TInteraction> = {
  deps: TDeps;
  interaction: TInteraction;
};

export type CommandContext<TDeps> = BaseContext<
  TDeps,
  ChatInputCommandInteraction
>;
export type AutocompleteContext<TDeps> = BaseContext<
  TDeps,
  AutocompleteInteraction
>;

export type UserContextMenuContext<TDeps> = BaseContext<
  TDeps,
  UserContextMenuCommandInteraction
>;

export type MessageContextMenuContext<TDeps> = BaseContext<
  TDeps,
  MessageContextMenuCommandInteraction
>;

export type ButtonContext<TDeps> = BaseContext<TDeps, ButtonInteraction>;
export type ModalContext<TDeps> = BaseContext<TDeps, ModalSubmitInteraction>;

export type StringSelectContext<TDeps> = BaseContext<
  TDeps,
  StringSelectMenuInteraction
>;
export type UserSelectContext<TDeps> = BaseContext<
  TDeps,
  UserSelectMenuInteraction
>;
export type RoleSelectContext<TDeps> = BaseContext<
  TDeps,
  RoleSelectMenuInteraction
>;
export type ChannelSelectContext<TDeps> = BaseContext<
  TDeps,
  ChannelSelectMenuInteraction
>;
export type MentionableSelectContext<TDeps> = BaseContext<
  TDeps,
  MentionableSelectMenuInteraction
>;

export type SlashCommandModule<TDeps> = {
  data: SharedSlashCommand;
  handler: (ctx: CommandContext<TDeps>) => Promise<void> | void;
  autocomplete?: (ctx: AutocompleteContext<TDeps>) => Promise<void> | void;
};

export type ContextMenuModule<TDeps> = {
  data: ContextMenuCommandBuilder;
  messageHandler?: (
    ctx: MessageContextMenuContext<TDeps>,
  ) => Promise<void> | void;
  userHandler?: (ctx: UserContextMenuContext<TDeps>) => Promise<void> | void;
};

export type ComponentModule<TContext> = {
  customIdPrefix: string;
  handler: (ctx: TContext) => Promise<void> | void;
};

export type GenericButtonModule<TDeps> = ComponentModule<ButtonContext<TDeps>>;
export type ModalModule<TDeps> = ComponentModule<ModalContext<TDeps>>;

export type StringSelectModule<TDeps> = ComponentModule<
  StringSelectContext<TDeps>
>;
export type UserSelectModule<TDeps> = ComponentModule<UserSelectContext<TDeps>>;
export type RoleSelectModule<TDeps> = ComponentModule<RoleSelectContext<TDeps>>;
export type ChannelSelectModule<TDeps> = ComponentModule<
  ChannelSelectContext<TDeps>
>;
export type MentionableSelectModule<TDeps> = ComponentModule<
  MentionableSelectContext<TDeps>
>;

export type ContinuityToken = {
  name: string;
  id: string;
};

export type ContinuityModuleContext<TDeps, TInteraction, TData> = {
  deps: TDeps;
  interaction: TInteraction;
  data: TData;
  token: ContinuityToken;
};

export type ContinuityModule<TDeps, TInteraction, TData> = {
  name: string;
  getContext: (id: string, deps: TDeps) => Promise<TData> | TData;
  handler: (
    ctx: ContinuityModuleContext<TDeps, TInteraction, TData>,
  ) => Promise<void> | void;
};

export type InteractionDefinitions<TDeps> = {
  commands?: SlashCommandModule<TDeps>[];
  contextMenus?: ContextMenuModule<TDeps>[];

  buttons?: GenericButtonModule<TDeps>[];
  modals?: ModalModule<TDeps>[];
  stringSelects?: StringSelectModule<TDeps>[];
  userSelects?: UserSelectModule<TDeps>[];
  roleSelects?: RoleSelectModule<TDeps>[];
  channelSelects?: ChannelSelectModule<TDeps>[];
  mentionableSelects?: MentionableSelectModule<TDeps>[];

  continuityButtons?: ContinuityModule<TDeps, ButtonInteraction, any>[];
  continuitySelects?: ContinuityModule<
    TDeps,
    StringSelectMenuInteraction,
    any
  >[];
};

export type InteractionInfo = {
  type:
    | 'chatInput'
    | 'autocomplete'
    | 'contextUser'
    | 'contextMessage'
    | 'button'
    | 'modal'
    | 'stringSelect'
    | 'userSelect'
    | 'roleSelect'
    | 'channelSelect'
    | 'mentionableSelect'
    | 'unknown';
  name: string;
  customId?: string;
  userId?: string;
  channelId?: string;
};

export type InteractionLogger = (params: {
  interaction: Interaction;
  info: InteractionInfo;
  durationMs: number;
  ok: boolean;
  error?: unknown;
}) => void | Promise<void>;
