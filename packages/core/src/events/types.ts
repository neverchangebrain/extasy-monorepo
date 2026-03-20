import type { Client, ClientEvents } from 'discord.js';

export type EventContext<TDeps, TEventName extends keyof ClientEvents> = {
  deps: TDeps;
  client: Client;
  event: TEventName;
  args: ClientEvents[TEventName];
};

export type EventModule<TDeps, TEventName extends keyof ClientEvents> = {
  event: TEventName;
  once?: boolean;
  handler: (ctx: EventContext<TDeps, TEventName>) => Promise<void> | void;
};

export type AnyEventModule<TDeps> = {
  [K in keyof ClientEvents]: EventModule<TDeps, K>;
}[keyof ClientEvents];
