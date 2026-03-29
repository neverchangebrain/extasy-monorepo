import { type ChatInputCommandInteraction, MessageFlags, bold, quote } from 'discord.js';

import { careers, db, eq } from '@extasy/db';

export const careerManageActionUpdateAvailable = async (
  interaction: ChatInputCommandInteraction<'cached'>,
): Promise<unknown> => {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const id = interaction.options.getString('career', true);

  if (!id) {
    await interaction.editReply({
      content: quote(`${interaction.user.toString()}, для обновления информации нужна указать вакансию.`),
    });
    return;
  }

  const [career] = await db.select().from(careers).where(eq(careers.id, id)).limit(1);

  if (!career) {
    await interaction.editReply({
      content: quote(
        `${interaction.user.toString()}, вакансия ${bold('не найдена')} или ${bold('удалена во время запроса')}.`,
      ),
    });
    return;
  }

  await db.update(careers).set({ available: !career.available }).where(eq(careers.id, id)).returning();

  await interaction.editReply({
    content: quote(
      `${interaction.user.toString()}, вакансия ${bold(career.name)} теперь ${
        !career.available ? bold('активна') : bold('неактивна')
      } для получения.`,
    ),
  });

  return;
};
