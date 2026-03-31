import {
  type ChatInputCommandInteraction,
  MessageFlags,
  ModalBuilder,
  TextInputStyle,
  bold,
  quote,
} from "discord.js";

import { careers, db, eq } from "@extasy/db";
import careerManageUpdateInfoModalInteraction from "@modals/career-manage-update-info";

export const careerManageActionUpdateInfo = async (
  interaction: ChatInputCommandInteraction<"cached">,
): Promise<unknown> => {
  const id = interaction.options.getString("career", true);

  if (!id) {
    await interaction.reply({
      content: quote(
        `${interaction.user.toString()}, для обновления информации нужна указать вакансию.`,
      ),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  const [career] = await db
    .select()
    .from(careers)
    .where(eq(careers.id, id))
    .limit(1);

  if (!career) {
    await interaction.reply({
      content: quote(
        `${interaction.user.toString()}, вакансия ${bold("не найдена")} или ${bold("удалена во время запроса")}.`,
      ),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  const context = await careerManageUpdateInfoModalInteraction.create({
    userId: interaction.user.id,
    oldContent: {
      id: career.id,
      name: career.name,
      description: career.description,
      roleId: career.roleId,
      question1: career.question1,
      question2: career.question2,
    },
  });

  const modal = new ModalBuilder()
    .setCustomId(context.customId)
    .setTitle("Обновить информацию о вакансии")
    .addLabelComponents(
      (labelBuilder) =>
        labelBuilder
          .setLabel("Название вакансии")
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId("name")
              .setStyle(TextInputStyle.Short)
              .setValue(career.name)
              .setPlaceholder("Модератор")
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel("Роль")
          .setRoleSelectMenuComponent((selectMenuBuilder) =>
            selectMenuBuilder
              .setCustomId("role")
              .setDefaultRoles([career.roleId])
              .setPlaceholder("Выбери роль для выдачи")
              .setMaxValues(1)
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel("Описание вакансии")
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId("description")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(career.description)
              .setPlaceholder(
                "Следят за порядком в голосовых каналах, помогают участникам с вопросами по серверу",
              )
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel("Вопрос по вакансии #1")
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId("question1")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(career.question1)
              .setPlaceholder(
                "Вы хотите модерировать голосовые или текстовые каналы?",
              )
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel("Вопрос по вакансии #2")
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId("question2")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(career.question2)
              .setPlaceholder("Ознакомлены ли вы с правилами сервера и TOS'ом?")
              .setRequired(true),
          ),
    );

  await interaction.showModal(modal);

  return;
};
