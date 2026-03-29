import { MessageFlags, ModalSubmitInteraction, bold, quote } from 'discord.js';

import { SendCareerCommandAccessIds } from '@extasy/config';
import { BaseContinuityModal, type ModalContinuityHandler } from '@extasy/core';
import { careers, db } from '@extasy/db';
import z from 'zod';

const CareerCreateSchema = z.object({
  userId: z.string(),
});

type CareerCreateDataType = z.infer<typeof CareerCreateSchema>;

class CareerCreateModalInteraction extends BaseContinuityModal<CareerCreateDataType> {
  constructor(handler: ModalContinuityHandler<CareerCreateDataType>) {
    super(CareerCreateSchema, { name: 'career_create_modal' });

    this.handler = handler;
  }
}

const careerCreateModalInteraction = new CareerCreateModalInteraction(async ({ interaction, data }) => {
  if (!SendCareerCommandAccessIds.includes(interaction.user.id) || interaction.user.id !== data.userId) {
    await interaction.reply({
      content: quote(`${interaction.user.toString()}, у тебя ${bold('нет доступа')} к этой команде.`),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  const name = interaction.fields.getTextInputValue('name').trim();
  const description = interaction.fields.getTextInputValue('description').trim();
  const role = interaction.fields.getSelectedRoles('role')!.at(0);

  if (!name || !description || !role) {
    await interaction.reply({
      content: quote('При создании вакансии все поля должны быть заполнены.'),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  const [createdCareer] = await db.insert(careers).values({ name, description, roleId: role.id }).returning();

  if (!createdCareer) {
    await interaction.reply({
      content: quote('Произошла ошибка при создании вакансии.'),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  await interaction.reply({
    content: quote(`${interaction.user.toString()}, вакансия ${bold('успешно')} создана.`),
    flags: [MessageFlags.Ephemeral],
  });
});

export default careerCreateModalInteraction;
