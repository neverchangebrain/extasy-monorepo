import { Client, GatewayIntentBits, Options, Partials } from 'discord.js';

import {
  type CoreClient,
  TempFileManager,
  importInteractions,
  isDevelopment,
} from '@extasy/core';
import { logger } from '@extasy/logger';
import path from 'path';

import { env } from './env';
import { clientEvents } from './events';

if (!isDevelopment) {
  logger.warn('running prod mode');
  TempFileManager.cleanup();
} else {
  logger.warn('running dev mode');
}

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (intent) => typeof intent === 'number',
  ),
  partials: Object.values(Partials).filter(
    (partial) => typeof partial === 'number',
  ),
  makeCache: Options.cacheWithLimits({}),
}) as CoreClient;

importInteractions(client, {
  interactionsDir: path.join(import.meta.dir, './interactions'),
});

clientEvents.forEach((callback, event) => client.on(event, callback));
client.login(env.ASSISTANT_BOT_TOKEN);

export { client as internalClient };
