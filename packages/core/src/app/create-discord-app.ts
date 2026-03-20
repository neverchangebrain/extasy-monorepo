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

export type CreateDiscordAppOptions<TDeps> = {
  deps: TDeps;
  interactions: InteractionDefinitions<TDeps>;

  client?: Client;
  clientOptions?: ClientOptions;

  logger?: InteractionLogger;
};

export type DiscordApp = {
  client: Client;
  start: (token: string) => Promise<void>;
  stop: () => Promise<void>;
};

export function createDiscordApp<TDeps>(
  opts: CreateDiscordAppOptions<TDeps>,
): DiscordApp {
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
    start: async (token: string) => {
      await client.login(token);
    },
    stop: async () => {
      client.destroy();
    },
  };
}
