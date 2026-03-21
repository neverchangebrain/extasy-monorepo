import { SlashCommandBuilder } from 'discord.js';

import { ChatInputCommandHandler } from '@extasy/core';

import { runExamplesSubcommand } from '../../subcommands/examples';

const command = new SlashCommandBuilder()
  .setName('examples')
  .setDescription('Examples for interaction handlers')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('generic-button')
      .setDescription('Show generic button interaction example'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('continuity-button')
      .setDescription('Show continuity button interaction example'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('continuity-select')
      .setDescription('Show continuity select menu interaction example'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('continuity-user-select')
      .setDescription('Show continuity user select menu interaction example'),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('continuity-modal')
      .setDescription('Show continuity modal submit interaction example'),
  );

export default new ChatInputCommandHandler(command, async (interaction) => {
  const subcommand = interaction.options.getSubcommand();

  await runExamplesSubcommand(interaction, subcommand);
});
