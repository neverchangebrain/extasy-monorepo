import {
  Client,
  type ClientOptions,
  GatewayIntentBits,
  Partials,
} from 'discord.js';

type RunBotOptions = {
  botName: string;
  tokenEnv: string;
  options?: ClientOptions;
};

export async function runBot({
  botName,
  tokenEnv,
  options,
}: RunBotOptions): Promise<void> {
  const token = process.env[tokenEnv];

  if (!token) {
    throw new Error(`[${botName}] Missing env ${tokenEnv}`);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
    ...options,
  });

  client.once('ready', () => {
    console.info(`[${botName}] ready as ${client.user?.tag ?? 'unknown-user'}`);
  });

  await client.login(token);
}
