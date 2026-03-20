import {
  Client,
  type ClientOptions,
  Events,
  GatewayIntentBits,
  type Interaction,
} from 'discord.js';

import type { AnyEventModule } from '../events/types';
import { createInteractionHandler } from '../interactions/interaction-handler';
import { createConsoleInteractionLogger } from '../interactions/interaction-logger';
import type {
  InteractionDefinitions,
  InteractionLogger,
} from '../interactions/types';

type CreateAppOptions<TDeps> = {
  deps: TDeps;
  interactions: InteractionDefinitions<TDeps>;
  events?: AnyEventModule<TDeps>[];

  client?: Client;
  clientOptions?: ClientOptions;

  logger?: InteractionLogger;
};

type App = {
  client: Client;
  start: (token: string) => Promise<unknown>;
  stop: () => Promise<unknown>;
};

export const createApp = <TDeps>(opts: CreateAppOptions<TDeps>): App => {
  const client =
    opts.client ??
    new Client(
      opts.clientOptions ?? {
        intents: [GatewayIntentBits.Guilds],
      },
    );

  const handler = createInteractionHandler({
    deps: opts.deps,
    interactions: opts.interactions,
    logger: opts.logger ?? createConsoleInteractionLogger(),
  });

  client.on(
    Events.InteractionCreate,
    (interaction: Interaction) => void handler(interaction),
  );

  for (const ev of opts.events ?? []) {
    const listener = (...args: any[]) =>
      void ev.handler({
        deps: opts.deps,
        client,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        event: ev.event,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        args,
      } as any);

    if (ev.once) {
      client.once(ev.event as any, listener);
    } else {
      client.on(ev.event as any, listener);
    }
  }

  return {
    client,

    start: async (token: string) => await client.login(token),
    stop: async () => client.destroy(),
  };
};
