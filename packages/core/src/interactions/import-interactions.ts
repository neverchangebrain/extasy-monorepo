import type { CoreClient } from '../client';
import { isDevelopment } from '../env';
import { InteractionsFileManager } from '../files/interactions-file-manager';

export const importInteractions = async (
  client: CoreClient,
  { interactionsDir }: { interactionsDir?: string } = {},
) => {
  client.chatInputCommands =
    await InteractionsFileManager.getChatInputCommands(interactionsDir);

  client.contextMenuMessageCommands =
    await InteractionsFileManager.getGlobalContextMenuMessageCommands(
      interactionsDir,
    );

  client.genericButtonInteractions =
    await InteractionsFileManager.getGenericButtonInteractions(interactionsDir);

  client.buttonInteractions =
    await InteractionsFileManager.getButtonInteractions(interactionsDir);

  client.selectMenuInteractions =
    await InteractionsFileManager.getSelectMenuInteractions(interactionsDir);
};
