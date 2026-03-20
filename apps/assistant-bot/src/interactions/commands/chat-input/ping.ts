import { SlashCommandBuilder } from 'discord.js';

import { ChatInputCommandHandler } from '@extasy/core';

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Pong!');

export default new ChatInputCommandHandler(command, async (interaction) => {
  await interaction.reply({
    ephemeral: true,
    content: '🟢',
  });
});
