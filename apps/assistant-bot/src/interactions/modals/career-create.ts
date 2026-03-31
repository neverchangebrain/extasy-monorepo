import {
  MessageFlags,
  type ModalSubmitInteraction,
  bold,
  quote,
} from "discord.js";

import { SendCareerCommandAccessIds } from "@extasy/config";
import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import { careers, db } from "@extasy/db";
import z from "zod";

const CareerCreateSchema = z.object({
  userId: z.string(),
});

type CareerCreateDataType = z.infer<typeof CareerCreateSchema>;

class CareerCreateModalInteraction extends BaseContinuity<
  CareerCreateDataType,
  ModalSubmitInteraction
> {
  constructor(
    handler: ContinuityHandler<CareerCreateDataType, ModalSubmitInteraction>,
  ) {
    super(CareerCreateSchema, { name: "career_create_modal" });

    this.handler = handler;
  }
}

const careerCreateModalInteraction = new CareerCreateModalInteraction(
  async ({ interaction, data }) => {
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
        content: quote("При создании вакансии все поля должны быть заполнены."),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const [createdCareer] = await db
      .insert(careers)
      .values({ name, description, roleId: role.id, question1, question2 })
      .returning();

    if (!createdCareer) {
      await interaction.reply({
        content: quote("Произошла ошибка при создании вакансии."),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.reply({
      content: quote(
        `${interaction.user.toString()}, вакансия ${bold("успешно")} создана.`,
      ),
      flags: [MessageFlags.Ephemeral],
    });
  },
);

export default careerCreateModalInteraction;
