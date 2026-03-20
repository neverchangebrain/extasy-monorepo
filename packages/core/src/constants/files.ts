import path from 'path';

const resolveDir = (baseDir: string, dir: string) => path.join(baseDir, dir);

const DEFAULT_INTERACTIONS_DIR = path.join(import.meta.dir, '../interactions');

export const getFilePaths = (interactionsDir = DEFAULT_INTERACTIONS_DIR) => ({
  // chat input commands
  CHAT_INPUT_COMMANDS: resolveDir(interactionsDir, './commands/chat-input'),

  // context menu message commands
  CONTEXT_MENU_MESSAGE_COMMANDS: resolveDir(
    interactionsDir,
    './commands/context-menu-message',
  ),

  // button interactions
  GENERIC_BUTTON_INTERACTIONS: resolveDir(interactionsDir, './buttons/generic'),
  BUTTON_INTERACTIONS: resolveDir(interactionsDir, './buttons'),

  // select menu interactions
  SELECT_MENU_INTERACTIONS: resolveDir(interactionsDir, './select-menu'),
});
