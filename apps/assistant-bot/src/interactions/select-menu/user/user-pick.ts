import { MessageFlags, type UserSelectMenuInteraction } from 'discord.js';

import { BaseContinuity } from '@extasy/core';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
});

class UserPickSelectMenu extends BaseContinuity<
  z.infer<typeof schema>,
  UserSelectMenuInteraction
> {
  constructor() {
    super(schema, { name: 'user-pick' });

    this.handler = async ({ interaction, data }) => {
      const selectedUserId = interaction.values[0] ?? 'unknown';

      await interaction.update({
        content: `${data.title}\nselected user: ${selectedUserId}`,
        components: [],
      });

      await interaction.followUp({
        content: 'continuity user select menu обработан',
        flags: [MessageFlags.Ephemeral],
      });
    };
  }
}

export default new UserPickSelectMenu();
