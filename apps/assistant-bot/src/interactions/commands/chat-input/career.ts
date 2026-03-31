import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

import { ChatInputCommandHandler } from '@extasy/core';
import { careers, db } from '@extasy/db';
import careerManageSubcommand from '@subcommands/career/manage';
import careerSendSubcommand from '@subcommands/career/send';

const data = new SlashCommandBuilder()
  .setName('career')
  .setDescription('Модуль вакансий')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addSubcommand((subcommand) => subcommand.setName('send').setDescription('Отправить набор с актуальными вакансиями'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('manage')
      .setDescription('Управление вакансиями')
      .addStringOption((option) =>
        option
          .setName('action')
          .setDescription('Создание или изменение вакансии')
          .setRequired(true)
          .addChoices(
            { name: 'Создать', value: 'create' },
            { name: 'Обновить информацию', value: 'update-info' },
            { name: 'Обновить актуальность', value: 'update-available' },
            { name: 'Удалить', value: 'delete' },
          ),
      )
      .addStringOption((option) =>
        option.setName('career').setDescription('Вакансия для управления').setAutocomplete(true).setRequired(false),
      ),
  );

export default new ChatInputCommandHandler(
  data,
  async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const subcommand = interaction.options.getSubcommand() as 'send' | 'manage';

    switch (subcommand) {
      case 'send':
        await careerSendSubcommand(interaction);
        break;
      case 'manage':
        await careerManageSubcommand(interaction);
        break;

      default:
        break;
    }
  },
  async (interaction) => {
    const subcommand = interaction.options.getSubcommand(false);

    if (subcommand !== 'manage') {
      await interaction.respond([]);
      return;
    }

    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name !== 'career') {
      await interaction.respond([]);
      return;
    }

    const focusedValue = focusedOption.value.toLowerCase();

    const foundCareers = await db.select().from(careers);

    const choices = foundCareers
      .filter((career) => career.name.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map((career) => ({
        name: `${career.name} (${career.available ? 'Активная' : 'Неактивная'})`,
        value: career.id,
      }));

    await interaction.respond(choices);
  },
);
