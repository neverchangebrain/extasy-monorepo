import { MessageFlags } from 'discord.js';

import { BaseContinuity } from '@extasy/core';
import { z } from 'zod';

const schema = z.object({
  actionName: z.string(),
});

class ConfirmActionButton extends BaseContinuity<z.infer<typeof schema>> {
  constructor() {
    super(schema, { name: 'confirm-action' });

    this.handler = async ({ interaction, data }) => {
      await interaction.update({
        content: `action confirmed: ${data.actionName}`,
        components: [],
      });

      await interaction.followUp({
        content: 'continuity button обработан',
        flags: [MessageFlags.Ephemeral],
      });
    };
  }
}

export default new ConfirmActionButton();
