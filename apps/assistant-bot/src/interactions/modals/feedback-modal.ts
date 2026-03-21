import { MessageFlags } from 'discord.js';

import { BaseContinuityModal } from '@extasy/core';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
});

class FeedbackModal extends BaseContinuityModal<z.infer<typeof schema>> {
  constructor() {
    super(schema, { name: 'feedback-modal' });

    this.handler = async ({ interaction, data }) => {
      const feedback = interaction.fields.getTextInputValue('feedback');

      await interaction.reply({
        content: `${data.title}\nfeedback: ${feedback}`,
        flags: [MessageFlags.Ephemeral],
      });
    };
  }
}

export default new FeedbackModal();
