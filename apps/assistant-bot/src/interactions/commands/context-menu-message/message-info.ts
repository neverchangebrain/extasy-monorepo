import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageFlags,
} from 'discord.js';

import { ContextMenuMessageCommandHandler } from '@extasy/core';

const command = new ContextMenuCommandBuilder()
  .setName('Message Info')
  .setType(ApplicationCommandType.Message);

export default new ContextMenuMessageCommandHandler(
  command,
  async (interaction) => {
    const targetMessage = interaction.targetMessage;
    const preview = targetMessage.content
      ? targetMessage.content.slice(0, 120)
      : '<empty content>';

    await interaction.reply({
      content: [
        `message id: ${targetMessage.id}`,
        `author id: ${targetMessage.author.id}`,
        `channel id: ${targetMessage.channelId}`,
        `preview: ${preview}`,
      ].join('\n'),
      flags: [MessageFlags.Ephemeral],
    });
  },
);
