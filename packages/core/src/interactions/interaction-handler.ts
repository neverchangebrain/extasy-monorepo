import { type Interaction, MessageFlags } from 'discord.js';

import { ChatInputCommandHandler, ContextMenuMessageCommandHandler } from '.';
import type { CoreClient } from '../client';
import { BaseContinuity } from './continuity/base';

export const interactionHandler = async (
  interaction: Interaction,
  client: CoreClient,
) => {
  if (interaction.isChatInputCommand()) {
    const command = client.chatInputCommands.get(
      interaction.commandName,
    ) as ChatInputCommandHandler;

    if (!command) return;

    try {
      command.handler(interaction, client);
    } catch {}
  }

  if (interaction.isMessageContextMenuCommand()) {
    const command = client.contextMenuMessageCommands.get(
      interaction.commandName,
    ) as ContextMenuMessageCommandHandler;

    if (!command) return;

    try {
      command.handler(interaction, client);
    } catch {}
  }

  const isContinuityInteraction =
    interaction.isButton() || interaction.isStringSelectMenu();

  if (isContinuityInteraction) {
    const currentUserId = interaction.user.id;
    const originalUserId = interaction.message.interactionMetadata?.user.id;

    if (currentUserId !== originalUserId) {
      interaction.deferUpdate();
      return;
    }

    // generic button interactions

    const genericButtonInteraction = client.genericButtonInteractions.get(
      interaction.customId,
    );

    if (genericButtonInteraction && interaction.isButton()) {
      try {
        await genericButtonInteraction.handler(interaction, client);
      } catch {
        await interaction.followUp({
          content: 'Ошибка при обработке взаимодействия.',
          flags: [MessageFlags.Ephemeral],
        });
      }
      return;
    }

    // button interactions

    const continuityInteraction = BaseContinuity.decodeButtonId(
      interaction.customId,
    );

    const buttonInteraction = client.buttonInteractions.get(
      continuityInteraction.name,
    );

    if (
      buttonInteraction &&
      buttonInteraction.handler &&
      interaction.isButton()
    ) {
      try {
        const data = await buttonInteraction.getContext(
          continuityInteraction.id,
        );
        await buttonInteraction.handler({ client, interaction, data });
      } catch (error) {
        await interaction.followUp({
          content: 'Ошибка при обработке взаимодействия.',
          flags: [MessageFlags.Ephemeral],
        });
      }
    }

    // select menu interactions

    const selectMenuInteraction = client.selectMenuInteractions.get(
      continuityInteraction.name,
    );

    if (
      selectMenuInteraction &&
      selectMenuInteraction.handler &&
      interaction.isStringSelectMenu()
    ) {
      try {
        const data = await selectMenuInteraction.getContext(
          continuityInteraction.id,
        );
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
      }
    }
  }
};
