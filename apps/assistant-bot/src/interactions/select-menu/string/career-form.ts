import {
  MessageFlags,
  ModalBuilder,
  type StringSelectMenuInteraction,
  TextInputStyle,
  bold,
  quote,
} from "discord.js";

import { UTC } from "@constants/utc";
import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import { careers, db, eq } from "@extasy/db";
import careerFormModalInteraction from "@modals/career-form";
import z from "zod";

const CareerFormSchema = z.object({
  content: z.array(
    z.object({
      label: z.string(),
      description: z.string(),
      value: z.string(),
    }),
  ),
});

type CareerFormDataType = z.infer<typeof CareerFormSchema>;

class CareerFormSelectMenuInteraction extends BaseContinuity<
  CareerFormDataType,
  StringSelectMenuInteraction
> {
  constructor(
    handler: ContinuityHandler<CareerFormDataType, StringSelectMenuInteraction>,
  ) {
    super(CareerFormSchema, { name: "career_form" });

    this.handler = handler;
  }
}

const careerFormSelectMenuInteraction = new CareerFormSelectMenuInteraction(
  async ({ interaction, data }) => {
    const selectedValue = interaction.values[0];
    if (!selectedValue) return;

    const [career] = await db
      .select()
      .from(careers)
      .where(eq(careers.id, selectedValue))
      .limit(1);
    if (!career) {
      await interaction.reply({
        content: quote(`Выбранная вакансия ${bold("не найдена")}.`),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const context = await careerFormModalInteraction.create({
      name: career.name,
      description: career.description,
      roleId: career.roleId,
      question1: career.question1,
      question2: career.question2,
    });

    const modal = new ModalBuilder()
      .setCustomId(context.customId)
      .setTitle("Форма для отклика на вакансию")
      .setLabelComponents(
        (labelBuilder) =>
          labelBuilder
            .setLabel("Ваше имя и возраст")
            .setTextInputComponent((inputBuilder) =>
              inputBuilder
                .setCustomId("base1")
                .setPlaceholder("Ярослав, 20 лет")
                .setStyle(TextInputStyle.Short)
                .setRequired(true),
            ),
        (labelBuilder) =>
          labelBuilder
            .setLabel("Опыт и причина отклика")
            .setDescription(
              "Расскажите кратко о своем опыте и почему вы заинтересованы в этой вакансии",
            )
            .setTextInputComponent((inputBuilder) =>
              inputBuilder
                .setCustomId("base2")
                .setPlaceholder(
                  "Был админом модераторов в 2019 году, познакомится с сервером изнутри",
                )
                .setStyle(TextInputStyle.Short)
                .setRequired(true),
            ),
        (labelBuilder) =>
          labelBuilder
            .setLabel("Ваш часовой пояс")
            .setDescription(
              "Он поможет нам понять, когда вам будет удобно работать и общаться с командой",
            )
            .setStringSelectMenuComponent((selectBuilder) =>
              selectBuilder
                .setCustomId("base3")
                .setPlaceholder("Выберите ваш часовой пояс")
                .addOptions(UTC.map((tz) => ({ label: tz, value: tz })))
                .setRequired(true),
            ),
        (labelBuilder) =>
          labelBuilder
            .setLabel(career.question1)
            .setTextInputComponent((inputBuilder) =>
              inputBuilder
                .setCustomId("question1")
                .setPlaceholder("Мой ответ...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true),
            ),
        (labelBuilder) =>
          labelBuilder
            .setLabel(career.question2)
            .setTextInputComponent((inputBuilder) =>
              inputBuilder
                .setCustomId("question2")
                .setPlaceholder("Мой ответ...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true),
            ),
      );

    await interaction.showModal(modal);

    await interaction.message.edit({
      components: [interaction.message.components[0]!],
    });
  },
);

export default careerFormSelectMenuInteraction;
