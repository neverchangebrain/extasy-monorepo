import {
  REST,
  type RESTPutAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import { parseEnv } from '@extasy/env';
import { z } from 'zod';

import { type ApplicationCommandBuilder } from '../interactions/import-interactions';

type RegisterApplicationCommandsOptions = {
  token: string;
  clientId: string;
  commands: ApplicationCommandBuilder[];
};

const env = parseEnv(
  z.object({
    GUILD_ID: z.string(),
  }),
);

const buildApplicationCommandJSON = (
  commands: ApplicationCommandBuilder[],
): RESTPutAPIApplicationCommandsJSONBody => commands.map((c) => c.toJSON());

export const registerApplicationCommands = async (
  opts: RegisterApplicationCommandsOptions,
) => {
  const rest = new REST({ version: '10' }).setToken(opts.token);

  const body = buildApplicationCommandJSON(opts.commands);
  const route = Routes.applicationGuildCommands(opts.clientId, env.GUILD_ID);

  return rest.put(route, { body });
};

/**
  await registerApplicationCommands({
      token: opts.token,
      clientId: opts.clientId,
      guildId: opts.guildId,
      commands: getApplicationCommandBuilders(opts.interactions),
    });
  };
 */
