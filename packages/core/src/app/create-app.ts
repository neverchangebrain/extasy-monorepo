import {
  Client,
  type ClientOptions,
  Events,
  GatewayIntentBits,
  type Interaction,
} from 'discord.js';

import { createInteractionHandler } from '../interactions/interaction-handler';
import { createConsoleInteractionLogger } from '../interactions/interaction-logger';
import type {
  InteractionDefinitions,
  InteractionLogger,
} from '../interactions/types';

type CreateAppOptions<TDeps> = {
  deps: TDeps;
  interactions: InteractionDefinitions<TDeps>;

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

  return {
    client,

    start: async (token: string) => await client.login(token),
    stop: async () => client.destroy(),
  };
};
