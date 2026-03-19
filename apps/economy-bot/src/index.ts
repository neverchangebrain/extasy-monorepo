import { createDb } from '@extasy/db';
import { runBot } from '@extasy/shared';

createDb();

await runBot({
  botName: 'economy-bot',
  tokenEnv: 'ECONOMY_BOT_TOKEN',
});
