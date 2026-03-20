import { Events, MessageFlags } from 'discord.js';

import { type EventHandler, interactionHandler } from '@extasy/core';
import { logger } from '@extasy/logger';

import { internalClient } from '../index';

export const interactionCreate: EventHandler<Events.InteractionCreate> = async (
  interaction,
) => {
  const inGuild = interaction.inGuild();

  if (!inGuild) {
    if (!interaction.isRepliable()) return;
    await interaction.reply({
      content: 'Взаимодействие может быть использовано только на сервере.',
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  const isCommand = interaction.isCommand();
  const isButton = interaction.isButton();
  const isSelectMenu = interaction.isStringSelectMenu();
  const isAutocomplete = interaction.isAutocomplete();

  const supportedInteraction =
    isCommand || isButton || isSelectMenu || isAutocomplete;

  if (supportedInteraction) {
    try {
      await interactionHandler(interaction, internalClient);
    } catch (error) {
      logger.error(error, 'failed to handle interaction');
    }
  }
};
