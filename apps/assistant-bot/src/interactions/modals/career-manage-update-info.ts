import { MessageFlags, ModalSubmitInteraction, bold, quote } from 'discord.js';

import { SendCareerCommandAccessIds } from '@extasy/config';
import { BaseContinuityModal, type ModalContinuityHandler } from '@extasy/core';
import { careers, db, eq } from '@extasy/db';
import z from 'zod';

const CareerManageUpdateInfoSchema = z.object({
  userId: z.string(),
  oldContent: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    roleId: z.string(),
  }),
});

type CareerManageUpdateInfoDataType = z.infer<typeof CareerManageUpdateInfoSchema>;

class CareerManageUpdateInfoModalInteraction extends BaseContinuityModal<CareerManageUpdateInfoDataType> {
  constructor(handler: ModalContinuityHandler<CareerManageUpdateInfoDataType>) {
    super(CareerManageUpdateInfoSchema, { name: 'career_manage_update_info_modal' });

    this.handler = handler;
  }
}

const careerManageUpdateInfoModalInteraction = new CareerManageUpdateInfoModalInteraction(
  async ({ interaction, data }) => {
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
        content: quote(`${interaction.user.toString()}, при создании вакансии все поля должны быть заполнены.`),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const [updatedCareer] = await db
      .update(careers)
      .set({
        ...(name !== data.oldContent.name ? { name } : {}),
        ...(description !== data.oldContent.description ? { description } : {}),
        ...(role.id !== data.oldContent.roleId ? { roleId: role.id } : {}),
      })
      .where(eq(careers.id, data.oldContent.id))
      .returning();

    if (!updatedCareer) {
      await interaction.reply({
        content: quote(
          `${interaction.user.toString()}, вакансия ${bold('не найдена')} или ${bold('удалена во время запроса')}.`,
        ),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.reply({
      content: quote(`${interaction.user.toString()}, данные вакансии ${bold('обновлены')}.`),
      flags: [MessageFlags.Ephemeral],
    });
  },
);

export default careerManageUpdateInfoModalInteraction;
