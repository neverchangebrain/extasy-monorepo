import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js';

import { BaseContinuity } from '@extasy/core';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
});

class ThemeSelectMenu extends BaseContinuity<
  z.infer<typeof schema>,
  StringSelectMenuInteraction
> {
  constructor() {
    super(schema, { name: 'theme-select' });

    this.handler = async ({ interaction, data }) => {
      const value = interaction.values[0] ?? 'unknown';

      await interaction.update({
        content: `${data.title}\nselected: ${value}`,
        components: [],
      });

      await interaction.followUp({
        content: 'continuity select menu обработан',
        flags: [MessageFlags.Ephemeral],
      });
    };
  }
}

export default new ThemeSelectMenu();
