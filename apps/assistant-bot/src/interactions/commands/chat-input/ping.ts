import { SlashCommandBuilder } from 'discord.js';

import { ChatInputCommandHandler } from '@extasy/core';

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Pong!');

export default new ChatInputCommandHandler(command, async (interaction) => {
  await interaction.reply({
    content: 'the fuck pong!',
  });
});
