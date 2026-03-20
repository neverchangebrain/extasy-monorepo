import { ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

import { GenericButtonInteractionHandler } from '@extasy/core';

export default new GenericButtonInteractionHandler(
  {
    name: 'ping-click',
    getButton: (data) =>
      new ButtonBuilder(data)
        .setCustomId('ping-click')
        .setLabel('Click me!')
        .setStyle(ButtonStyle.Primary),
  },
  async (interaction) => {
    await interaction.reply({
      content: 'shit bro',
      flags: [MessageFlags.Ephemeral],
    });
  },
);
