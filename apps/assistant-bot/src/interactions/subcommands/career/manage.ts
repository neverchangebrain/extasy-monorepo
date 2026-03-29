import { type ChatInputCommandInteraction, MessageFlags, ModalBuilder, TextInputStyle, bold, quote } from 'discord.js';

import { ManageCareerCommandAccessIds } from '@extasy/config';

import { careerManageActionCreate } from './action/create';
import { careerManageActionDelete } from './action/delete';
import { careerManageActionUpdateAvailable } from './action/update-available';
import { careerManageActionUpdateInfo } from './action/update-info';

const careerManageSubcommand = async (interaction: ChatInputCommandInteraction<'cached'>): Promise<unknown> => {
  const action = interaction.options.getString('action', true) as
    | 'create'
    | 'update-info'
    | 'update-available'
    | 'delete';

  if (!ManageCareerCommandAccessIds.includes(interaction.user.id)) {
    await interaction.reply({
      content: quote(`${interaction.user.toString()}, у тебя ${bold('нет доступа')} к этой команде.`),
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  if (action === 'create') {
    await careerManageActionCreate(interaction);
    return;
  }

  switch (action) {
    case 'update-info':
      await careerManageActionUpdateInfo(interaction);
      break;
    case 'update-available':
      await careerManageActionUpdateAvailable(interaction);
      break;
    case 'delete':
      await careerManageActionDelete(interaction);
      break;

    default:
      break;
  }
};

export default careerManageSubcommand;
