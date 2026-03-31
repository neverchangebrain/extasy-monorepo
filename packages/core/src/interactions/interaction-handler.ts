import { type Interaction, MessageFlags } from 'discord.js';

import { logger } from '@extasy/logger';

import { ChatInputCommandHandler, ContextMenuMessageCommandHandler } from '.';
import type { CoreClient } from '../client';
import { BaseContinuity } from './continuity/base';

export const interactionHandler = async (interaction: Interaction, client: CoreClient) => {
  if (interaction.isChatInputCommand()) {
    const command = client.chatInputCommands.get(interaction.commandName) as ChatInputCommandHandler;

    if (!command) return;

    try {
      command.handler(interaction, client);
    } catch (error) {
      const payload = {
        content: 'Ошибка при обработке взаимодействия.',
        flags: [MessageFlags.Ephemeral] as const,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }

      logger.error({ error }, 'error handling chat-input-interaction');
    }
  }

  if (interaction.isAutocomplete()) {
    const command = client.chatInputCommands.get(interaction.commandName) as ChatInputCommandHandler;

    if (!command || !command.autocomplete) return;

    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      await interaction.respond([]);

      logger.error({ error }, 'error handling autocomplete-interaction');
    }
  }

  if (interaction.isMessageContextMenuCommand()) {
    const command = client.contextMenuMessageCommands.get(interaction.commandName) as ContextMenuMessageCommandHandler;

    if (!command) return;

    try {
      command.handler(interaction, client);
    } catch (error) {
      const payload = {
        content: 'Ошибка при обработке взаимодействия.',
        flags: [MessageFlags.Ephemeral] as const,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }

      logger.error({ error }, 'error handling context-menu-message-interaction');
    }
  }

  if (interaction.isModalSubmit()) {
    const continuityInteraction = BaseContinuity.decodeCustomId(interaction.customId);

    const modalInteraction = client.modalInteractions.get(continuityInteraction.name);

    if (!modalInteraction || !modalInteraction.handler) return;

    try {
      const data = await modalInteraction.getContext(continuityInteraction.id);
      await modalInteraction.handler({ client, interaction, data });
    } catch (error) {
      const payload = {
        content: 'Ошибка при обработке взаимодействия.',
        flags: [MessageFlags.Ephemeral] as const,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }

      logger.error({ error }, 'error handling modal-submit-interaction');
    }

    return;
  }

  const isAnySelectMenu =
    interaction.isStringSelectMenu() ||
    interaction.isUserSelectMenu() ||
    interaction.isRoleSelectMenu() ||
    interaction.isChannelSelectMenu() ||
    interaction.isMentionableSelectMenu();

  const isContinuityInteraction = interaction.isButton() || isAnySelectMenu;

  if (isContinuityInteraction) {
    const currentUserId = interaction.user.id;
    const originalUserId = interaction.message.interactionMetadata?.user.id;

    if (currentUserId !== originalUserId) {
      interaction.deferUpdate();
      return;
    }

    // generic button interactions

    const genericButtonInteraction = client.genericButtonInteractions.get(interaction.customId);

    if (genericButtonInteraction && interaction.isButton()) {
      try {
        await genericButtonInteraction.handler(interaction, client);
      } catch (error) {
        await interaction.followUp({
          content: 'Ошибка при обработке взаимодействия.',
          flags: [MessageFlags.Ephemeral],
        });
        logger.error({ error }, 'error handling generic-button-interaction');
      }
      return;
    }

    // button interactions

    const continuityInteraction = BaseContinuity.decodeCustomId(interaction.customId);

    const buttonInteraction = client.buttonInteractions.get(continuityInteraction.name);

    if (buttonInteraction && buttonInteraction.handler && interaction.isButton()) {
      try {
        const data = await buttonInteraction.getContext(continuityInteraction.id);
        await buttonInteraction.handler({ client, interaction, data });
      } catch (error) {
        await interaction.followUp({
          content: 'Ошибка при обработке взаимодействия.',
          flags: [MessageFlags.Ephemeral],
        });
        logger.error({ error }, 'error handling button-interaction');
      }
    }

    // select menu interactions

    if (isAnySelectMenu) {
      const selectMenuInteraction = interaction.isStringSelectMenu()
        ? client.stringSelectMenuInteractions.get(continuityInteraction.name)
        : interaction.isUserSelectMenu()
          ? client.userSelectMenuInteractions.get(continuityInteraction.name)
          : interaction.isRoleSelectMenu()
            ? client.roleSelectMenuInteractions.get(continuityInteraction.name)
            : interaction.isChannelSelectMenu()
              ? client.channelSelectMenuInteractions.get(continuityInteraction.name)
              : interaction.isMentionableSelectMenu()
                ? client.mentionableSelectMenuInteractions.get(continuityInteraction.name)
                : undefined;

      if (selectMenuInteraction && selectMenuInteraction.handler) {
        try {
          const data = await selectMenuInteraction.getContext(continuityInteraction.id);

          await selectMenuInteraction.handler({
            client,
            interaction,
            data,
          });
        } catch (error) {
          await interaction.followUp({
            content: 'Ошибка при обработке взаимодействия.',
            flags: [MessageFlags.Ephemeral],
          });
          logger.error({ error }, 'error handling select-menu-interaction');
        }
      }
    }
  }
};
