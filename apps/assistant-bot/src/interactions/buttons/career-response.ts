import { MessageFlags, quote, type ButtonInteraction } from "discord.js";
import { BaseContinuity, type ContinuityHandler } from "@extasy/core";
import z from "zod";

const CareerResponseSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
});

type CareerResponseType = z.infer<typeof CareerResponseSchema>;

class CareerResponseButton extends BaseContinuity<
  CareerResponseType,
  ButtonInteraction
> {
  constructor(
    handler: ContinuityHandler<CareerResponseType, ButtonInteraction>,
  ) {
    super(CareerResponseSchema, { name: "career_response" });

    this.handler = handler;
  }
}

const careerResponseButton = new CareerResponseButton(
  async ({ interaction, data }) => {
    const action = interaction.customId.endsWith(":accept")
      ? "accept"
      : "reject";
  },
);

export default careerResponseButton;
