import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  bold,
  quote,
} from "discord.js";

import { careers, db, eq } from "@extasy/db";
import careerFormSelectMenuInteraction from "@select-menu/string/career-form";

import careerPreviewEmbed from "@constants/embeds/career-preview.json";

const careerSendSubcommand = async (
  interaction: ChatInputCommandInteraction<"cached">,
): Promise<unknown> => {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const embed = new EmbedBuilder(careerPreviewEmbed);

  const actualCareers = await db
    .select()
    .from(careers)
    .where(eq(careers.available, true));

  const context = await careerFormSelectMenuInteraction.create({
    content: actualCareers.map((career) => ({
      label: career.name,
      description: career.description,
      value: career.id,
    })),
  });

  const actionRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
      new StringSelectMenuBuilder()
        .setCustomId(context.customId)
        .setPlaceholder("🔎 Выберите желаемую вакансию")
        .setMaxValues(1)
        .setOptions(
          actualCareers.map((career) => ({
            label: career.name,
            description: career.description,
            value: career.id,
          })),
        )
        .setRequired(true),
    );

  if (interaction.channel?.isSendable()) {
    await interaction.channel.send({
      embeds: [embed],
      components: [actionRow],
    });
  }

  await interaction.editReply({
    content: quote(
      `${interaction.user.toString()}, наборы ${bold("успешно")} отправлены.`,
    ),
  });
  return;
};

export default careerSendSubcommand;
