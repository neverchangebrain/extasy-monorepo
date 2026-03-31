import { REST, Routes } from "discord.js";

import { logger } from "@extasy/logger";

import { env } from "../env";
import { InteractionsFileManager } from "../files/interactions-file-manager";

export const deployCommands = async (
  token: string,
  clientId: string,
  interactionsDir?: string | undefined,
) => {
  const chatInputCommands = (
    await InteractionsFileManager.getChatInputCommands(interactionsDir)
  ).map((command) => command.metadata.toJSON());

  logger.info(`loaded ${chatInputCommands.length} commands`);

  const contextMenuMessageCommands = (
    await InteractionsFileManager.getContextMenuMessageCommands(interactionsDir)
  ).map((command) => command.metadata.toJSON());

  logger.info(
    `loaded ${contextMenuMessageCommands.length} context menu message commands`,
  );

  const rest = new REST({ version: "10" }).setToken(token);

  const commands = [...chatInputCommands, ...contextMenuMessageCommands];

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, env.GUILD_ID), {
      body: commands,
    });

    logger.info("successfully registered");
  } catch (error) {
    logger.error(`error registering: ${error}`);
  }
};
