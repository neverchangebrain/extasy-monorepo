import type { Events } from "discord.js";

import type { EventHandler } from "@extasy/core";
import { logger } from "@extasy/logger";

export const startupClient: EventHandler<Events.ClientReady> = async (
  client,
) => {
  logger.info(
    `staff-bot logged in as ${client.user.username} (${client.user.id})`,
  );
};
