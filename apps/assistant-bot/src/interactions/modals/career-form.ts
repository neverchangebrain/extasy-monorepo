import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  codeBlock,
  EmbedBuilder,
  MessageFlags,
  quote,
  time,
  type ModalSubmitInteraction,
} from "discord.js";
import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import z from "zod";
import { CareerFormsId } from "@extasy/config";
import careerFormEmbed from "@constants/embeds/career-form.json";
import careerResponseButton from "@buttons/career-response";

const CareerForm = z.object({
  roleId: z.string(),
  question1: z.string(),
  question2: z.string(),
});

export type CareerFormType = z.infer<typeof CareerForm>;

class CareerFormModalInteraction extends BaseContinuity<
  CareerFormType,
  ModalSubmitInteraction
> {
  constructor(
    handler: ContinuityHandler<CareerFormType, ModalSubmitInteraction>,
  ) {
    super(CareerForm, { name: "career_form_modal" });

    this.handler = handler;
  }
}

const careerFormModalInteraction = new CareerFormModalInteraction(
  async ({ interaction, data }) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const channel = interaction.guild?.channels.cache.get(CareerFormsId);
    if (!channel?.isTextBased()) {
      await interaction.editReply({
        content: quote(
          `${interaction.user.toString()}, произошла ошибка при отправке формы.`,
        ),
      });
      return;
    }

    const askFirst = interaction.fields.getTextInputValue("base1").trim();
    const askSecond = interaction.fields.getTextInputValue("base2").trim();
    const askThird = interaction.fields
      .getStringSelectValues("base3")
      .at(0)
      ?.trim();
    const askFourth = interaction.fields.getTextInputValue("question1").trim();
    const askFifth = interaction.fields.getTextInputValue("question2").trim();

    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (!member) {
      await interaction.editReply({
        content: quote(
          `${interaction.user.toString()}, произошла ошибка при отправке формы.`,
        ),
      });
      return;
    }

    const embed = new EmbedBuilder(careerFormEmbed)
      .setThumbnail(
        interaction.user.displayAvatarURL({ size: 4096, extension: "png" }),
      )
      .setDescription(
        [
          `${bold("Линк:")} ${interaction.user.toString()}`,
          `${bold("ID и Тег:")} ${interaction.user.id} / @${interaction.user.tag}`,
          `${bold("Создал аккаунт:")} ${time(interaction.user.createdAt, "R")}`,
          member.joinedAt &&
            `${bold("Присоединился:")} ${time(member.joinedAt, "R")}`,
        ].join("\n"),
      )
      .setFields(
        {
          name: "> Имя и возраст",
          value: codeBlock("ini", askFirst || "Ответ не предоставлен"),
        },
        {
          name: "> Опыт и причина",
          value: codeBlock("ini", askSecond || "Ответ не предоставлен"),
        },
        {
          name: "> Зона UTC",
          value: codeBlock("ini", askThird || "Ответ не предоставлен"),
        },
        {
          name: `> ${data.question1}`,
          value: codeBlock("ini", askFourth || "Ответ не предоставлен"),
        },
        {
          name: `> ${data.question2}`,
          value: codeBlock("ini", askFifth || "Ответ не предоставлен"),
        },
      );

    const context = await careerResponseButton.create({
      userId: interaction.user.id,
      roleId: data.roleId,
    });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId(`${context.customId}:accept`)
        .setLabel("Принять")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${context.customId}:reject`)
        .setLabel("Отказ")
        .setStyle(ButtonStyle.Secondary),
    );

    await channel.send({ embeds: [embed], components: [actionRow] });

    await interaction.editReply({
      content: quote(
        `${interaction.user.toString()}, твоя заявка успешно отправлена!`,
      ),
    });
  },
);

export default careerFormModalInteraction;
