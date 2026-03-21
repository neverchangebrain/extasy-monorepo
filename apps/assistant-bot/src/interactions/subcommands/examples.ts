import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from 'discord.js';

import confirmActionButton from '../buttons/confirm-action';
import pingClickButton from '../buttons/generic/ping-click';
import feedbackModal from '../modals/feedback-modal';
import themeSelectMenu from '../select-menu/theme-select';
import userPickSelectMenu from '../select-menu/user/user-pick';

export const runExamplesSubcommand = async (
  interaction: ChatInputCommandInteraction,
  subcommand: string,
) => {
  if (subcommand === 'generic-button') {
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      pingClickButton.metadata.getButton(),
    );

    await interaction.reply({
      content: 'generic button example',
      components: [actionRow],
    });
    return;
  }

  if (subcommand === 'continuity-button') {
    const context = await confirmActionButton.create({
      actionName: 'demo-task',
    });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(context.buttonId)
        .setLabel('Confirm action')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
      content: 'continuity button example',
      components: [actionRow],
    });
    return;
  }

  if (subcommand === 'continuity-select') {
    const context = await themeSelectMenu.create({
      title: 'choose your theme',
    });

    const actionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(context.buttonId)
          .setPlaceholder('pick one')
          .addOptions(
            { label: 'Minimal', value: 'minimal' },
            { label: 'Bold', value: 'bold' },
            { label: 'Retro', value: 'retro' },
          ),
      );

    await interaction.reply({
      content: 'continuity select menu example',
      components: [actionRow],
    });
    return;
  }

  if (subcommand === 'continuity-user-select') {
    const context = await userPickSelectMenu.create({
      title: 'choose a user',
    });

    const actionRow =
      new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
        new UserSelectMenuBuilder()
          .setCustomId(context.buttonId)
          .setPlaceholder('pick user'),
      );

    await interaction.reply({
      content: 'continuity user select menu example',
      components: [actionRow],
    });

    return;
  }

  if (subcommand === 'continuity-modal') {
    const context = await feedbackModal.create({
      title: 'leave feedback',
    });

    const modal = new ModalBuilder()
      .setCustomId(context.customId)
      .setTitle('Feedback');

    const input = new TextInputBuilder()
      .setCustomId('feedback')
      .setLabel('Your feedback')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(input),
    );

    await interaction.showModal(modal);
    return;
  }

  await interaction.reply({
    content: `unknown subcommand: ${subcommand}`,
    ephemeral: true,
  });
};
