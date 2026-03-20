import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';

import confirmActionButton from '../buttons/confirm-action';
import pingClickButton from '../buttons/generic/ping-click';
import themeSelectMenu from '../select-menu/theme-select';

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

  await interaction.reply({
    content: `unknown subcommand: ${subcommand}`,
    ephemeral: true,
  });
};
