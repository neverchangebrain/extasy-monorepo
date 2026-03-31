import {
  MessageFlags,
  type ModalSubmitInteraction,
  bold,
  quote,
} from "discord.js";

import { SendCareerCommandAccessIds } from "@extasy/config";
import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import { careers, db, eq } from "@extasy/db";
import z from "zod";

const CareerManageUpdateInfoSchema = z.object({
  userId: z.string(),
  oldContent: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    roleId: z.string(),
    question1: z.string(),
    question2: z.string(),
  }),
});

type CareerManageUpdateInfoDataType = z.infer<
  typeof CareerManageUpdateInfoSchema
>;

class CareerManageUpdateInfoModalInteraction extends BaseContinuity<
  CareerManageUpdateInfoDataType,
  ModalSubmitInteraction
> {
  constructor(
    handler: ContinuityHandler<
      CareerManageUpdateInfoDataType,
      ModalSubmitInteraction
    >,
  ) {
    super(CareerManageUpdateInfoSchema, {
      name: "career_manage_update_info_modal",
    });

    this.handler = handler;
  }
}

const careerManageUpdateInfoModalInteraction =
  new CareerManageUpdateInfoModalInteraction(async ({ interaction, data }) => {
    if (
      !SendCareerCommandAccessIds.includes(interaction.user.id) ||
      interaction.user.id !== data.userId
    ) {
      await interaction.reply({
        content: quote(
          `${interaction.user.toString()}, у тебя ${bold("нет доступа")} к этой команде.`,
        ),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const name = interaction.fields.getTextInputValue("name").trim();
    const description = interaction.fields
      .getTextInputValue("description")
      .trim();
    const role = interaction.fields.getSelectedRoles("role")?.at(0);
    const question1 = interaction.fields.getTextInputValue("question1").trim();
    const question2 = interaction.fields.getTextInputValue("question2").trim();

    if (!name || !description || !role || !question1 || !question2) {
      await interaction.reply({
        content: quote(
          `${interaction.user.toString()}, при создании вакансии все поля должны быть заполнены.`,
        ),
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
        ...(question1 !== data.oldContent.question1 ? { question1 } : {}),
        ...(question2 !== data.oldContent.question2 ? { question2 } : {}),
      })
      .where(eq(careers.id, data.oldContent.id))
      .returning();

    if (!updatedCareer) {
      await interaction.reply({
        content: quote(
          `${interaction.user.toString()}, вакансия ${bold("не найдена")} или ${bold("удалена во время запроса")}.`,
        ),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.reply({
      content: quote(
        `${interaction.user.toString()}, данные вакансии ${bold("обновлены")}.`,
      ),
      flags: [MessageFlags.Ephemeral],
    });
  });

export default careerManageUpdateInfoModalInteraction;
