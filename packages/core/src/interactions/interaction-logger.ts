import type { Interaction } from 'discord.js';

import type { InteractionInfo, InteractionLogger } from './types';

export const getInteractionInfo = (
  interaction: Interaction,
): InteractionInfo => {
  if (interaction.isChatInputCommand()) {
    return {
      type: 'chatInput',
      name: interaction.commandName,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isAutocomplete()) {
    return {
      type: 'autocomplete',
      name: interaction.commandName,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isUserContextMenuCommand()) {
    return {
      type: 'contextUser',
      name: interaction.commandName,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isMessageContextMenuCommand()) {
    return {
      type: 'contextMessage',
      name: interaction.commandName,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isButton()) {
    return {
      type: 'button',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isModalSubmit()) {
    return {
      type: 'modal',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId ?? undefined,
    };
  }

  if (interaction.isStringSelectMenu()) {
    return {
      type: 'stringSelect',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isUserSelectMenu()) {
    return {
      type: 'userSelect',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId ?? undefined,
    };
  }

  if (interaction.isRoleSelectMenu()) {
    return {
      type: 'roleSelect',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isChannelSelectMenu()) {
    return {
      type: 'channelSelect',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  if (interaction.isMentionableSelectMenu()) {
    return {
      type: 'mentionableSelect',
      name: interaction.customId,
      customId: interaction.customId,
      userId: interaction.user.id,
      channelId: interaction.channelId,
    };
  }

  return {
    type: 'unknown',
    name: 'unknown',
    channelId: 'channelId' in interaction ? interaction.channelId : undefined,
  };
};

export const createConsoleInteractionLogger = (): InteractionLogger => {
  return ({ info, durationMs, ok, error }) => {
    const base = `[${info.type}] ${info.name} +${durationMs}ms`;

    if (ok) {
      console.info(base);
      return;
    }

    console.error(base);
    if (error) {
      console.error(error);
    }
  };
};
