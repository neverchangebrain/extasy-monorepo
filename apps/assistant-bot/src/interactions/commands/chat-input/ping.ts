import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';

import { ChatInputCommandHandler } from '@extasy/core';

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Pong!');

export default new ChatInputCommandHandler(command, async (interaction) => {
  const actionRow = new ActionRowBuilder<ButtonBuilder>();

  actionRow.addComponents(
    new ButtonBuilder()
      .setLabel('Click me!')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('ping-click'),
  );

  await interaction.reply({
    content: 'the fuck pong!',
    components: [actionRow],
  });
});
