import { MessageFlags, quote, type ModalSubmitInteraction } from "discord.js";

import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import z from "zod";
import { CareerFormsId } from "@extasy/config";

const CareerForm = z.object({
  name: z.string(),
  description: z.string(),
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

    const embed;
  },
);

export default careerFormModalInteraction;
