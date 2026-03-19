import { createDb } from '@extasy/db';
import { runBot } from '@extasy/shared';

createDb();

await runBot({
  botName: 'assistant-bot',
  tokenEnv: 'ASSISTANT_BOT_TOKEN',
});
