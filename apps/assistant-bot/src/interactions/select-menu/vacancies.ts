import type { StringSelectMenuInteraction } from 'discord.js';

import { BaseContinuity, type ContinuityHandler } from '@extasy/core';
import z from 'zod';

const VacanciesSchema = z.object({
  content: z.array(
    z.object({
      label: z.string(),
      description: z.string(),
      value: z.string(),
    }),
  ),
});

type VacanciesDataType = z.infer<typeof VacanciesSchema>;

class VacanciesSelectMenuInteraction extends BaseContinuity<VacanciesDataType, StringSelectMenuInteraction> {
  constructor(handler: ContinuityHandler<VacanciesDataType, StringSelectMenuInteraction>) {
    super(VacanciesSchema, { name: 'actual_vacancies' });

    this.handler = handler;
  }
}

const vacanciesSelectMenuInteraction = new VacanciesSelectMenuInteraction(async ({ interaction, data }) => {
  const selectedVacancionRole = interaction.values[0];
});

export default vacanciesSelectMenuInteraction;
