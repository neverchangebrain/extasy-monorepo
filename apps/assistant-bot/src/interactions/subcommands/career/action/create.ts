import { ChatInputCommandInteraction, ModalBuilder, TextInputStyle } from 'discord.js';

import careerCreateModalInteraction from '@modals/career-create';

export const careerManageActionCreate = async (
  interaction: ChatInputCommandInteraction<'cached'>,
): Promise<unknown> => {
  const context = await careerCreateModalInteraction.create({
    userId: interaction.user.id,
  });

  const modal = new ModalBuilder()
    .setCustomId(context.customId)
    .setTitle('Создать вакансию')
    .addLabelComponents(
      (labelBuilder) =>
        labelBuilder
          .setLabel('Название вакансии')
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId('name')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Модератор')
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel('Роль')
          .setRoleSelectMenuComponent((selectMenuBuilder) =>
            selectMenuBuilder
              .setCustomId('role')
              .setPlaceholder('Выбери роль для выдачи')
              .setMaxValues(1)
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel('Описание вакансии')
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId('description')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Следят за порядком в голосовых каналах, помогают участникам с вопросами по серверу')
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel('Вопрос по вакансии #1')
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId('question1')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Вы хотите модерировать голосовые или текстовые каналы?')
              .setRequired(true),
          ),
      (labelBuilder) =>
        labelBuilder
          .setLabel('Вопрос по вакансии #2')
          .setTextInputComponent((textInputBuilder) =>
            textInputBuilder
              .setCustomId('question2')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder("Ознакомлены ли вы с правилами сервера и TOS'ом?")
              .setRequired(true),
          ),
    );

  await interaction.showModal(modal);

  return;
};
