import type { CoreClient } from '../client';
import { InteractionsFileManager } from '../files/interactions-file-manager';

export const importInteractions = async (
  client: CoreClient,
  { interactionsDir }: { interactionsDir?: string } = {},
) => {
  client.chatInputCommands =
    await InteractionsFileManager.getChatInputCommands(interactionsDir);

  client.contextMenuMessageCommands =
    await InteractionsFileManager.getContextMenuMessageCommands(
      interactionsDir,
    );

  client.genericButtonInteractions =
    await InteractionsFileManager.getGenericButtonInteractions(interactionsDir);

  client.buttonInteractions =
    await InteractionsFileManager.getButtonInteractions(interactionsDir);

  client.selectMenuInteractions =
    await InteractionsFileManager.getSelectMenuInteractions(interactionsDir);
};
