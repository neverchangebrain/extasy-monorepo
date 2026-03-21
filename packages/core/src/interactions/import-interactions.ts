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

  client.stringSelectMenuInteractions =
    await InteractionsFileManager.getStringSelectMenuInteractions(
      interactionsDir,
    );

  client.userSelectMenuInteractions =
    await InteractionsFileManager.getUserSelectMenuInteractions(
      interactionsDir,
    );

  client.roleSelectMenuInteractions =
    await InteractionsFileManager.getRoleSelectMenuInteractions(
      interactionsDir,
    );

  client.channelSelectMenuInteractions =
    await InteractionsFileManager.getChannelSelectMenuInteractions(
      interactionsDir,
    );

  client.mentionableSelectMenuInteractions =
    await InteractionsFileManager.getMentionableSelectMenuInteractions(
      interactionsDir,
    );

  client.modalInteractions =
    await InteractionsFileManager.getModalInteractions(interactionsDir);
};
