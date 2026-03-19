import { createDb } from '@extasy/db';
import { runBot } from '@extasy/shared';

createDb();

await runBot({
  botName: 'mod-bot',
  tokenEnv: 'MOD_BOT_TOKEN',
});
