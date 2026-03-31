import { type Events, MessageFlags } from "discord.js";

import { type EventHandler, interactionHandler } from "@extasy/core";
import { logger } from "@extasy/logger";

import { internalClient } from "../index";

export const interactionCreate: EventHandler<Events.InteractionCreate> = async (
  interaction,
) => {
  if (!interaction.inGuild()) {
    if (!interaction.isRepliable()) return;

    await interaction.reply({
      content: "Взаимодействие доступно только на сервере.",
      flags: [MessageFlags.Ephemeral],
    });

    return;
  }

  const supportedInteraction =
    interaction.isCommand() ||
    interaction.isButton() ||
    interaction.isAutocomplete() ||
    interaction.isModalSubmit() ||
    interaction.isAnySelectMenu();

  if (!supportedInteraction) return;

  try {
    await interactionHandler(interaction, internalClient);
  } catch (error) {
    logger.error(error, "failed to handle interaction");
  }
};
