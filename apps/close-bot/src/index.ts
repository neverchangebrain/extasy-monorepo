import { createDb } from '@extasy/db';
import { runBot } from '@extasy/shared';

createDb();

await runBot({
  botName: 'close-bot',
  tokenEnv: 'CLOSE_BOT_TOKEN',
});
