import {
  Client,
  Collection,
  GatewayIntentBits,
  Options,
  Partials,
} from "discord.js";

import {
  type CoreClient,
  TempFileManager,
  deployCommands,
  importInteractions,
  isDevelopment,
} from "@extasy/core";
import { logger } from "@extasy/logger";
import path from "node:path";

import { env } from "./env";
import { clientEvents } from "./events";

if (!isDevelopment) {
  logger.warn("running prod mode");
  TempFileManager.cleanup();
} else {
  logger.warn("running dev mode");
}

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (intent) => typeof intent === "number",
  ),
  partials: Object.values(Partials).filter(
    (partial) => typeof partial === "number",
  ),
  makeCache: Options.cacheWithLimits({}),
}) as CoreClient;

client.chatInputCommands = new Collection();
client.contextMenuMessageCommands = new Collection();
client.genericButtonInteractions = new Collection();
client.buttonInteractions = new Collection();
client.stringSelectMenuInteractions = new Collection();
client.userSelectMenuInteractions = new Collection();
client.roleSelectMenuInteractions = new Collection();
client.channelSelectMenuInteractions = new Collection();
client.mentionableSelectMenuInteractions = new Collection();
client.modalInteractions = new Collection();

await importInteractions(client, {
  interactionsDir: path.join(import.meta.dir, "./interactions"),
});

deployCommands(
  env.STAFF_BOT_TOKEN,
  env.STAFF_BOT_ID,
  path.join(import.meta.dir, "./interactions"),
);

clientEvents.forEach((callback, event) => client.on(event, callback));
client.login(env.STAFF_BOT_TOKEN);

export { client as internalClient };
