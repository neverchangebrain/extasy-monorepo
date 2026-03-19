import { createDb } from '@extasy/db';
import { runBot } from '@extasy/shared';

createDb();

await runBot({
  botName: 'event-bot',
  tokenEnv: 'EVENT_BOT_TOKEN',
});
