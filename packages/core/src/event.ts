import type { ClientEvents } from "discord.js";

export type EventHandler<T extends keyof ClientEvents> = (
  ...args: ClientEvents[T]
) => void;

export class ClientEventsMap extends Map<
  keyof ClientEvents,
  (...args: ClientEvents[keyof ClientEvents]) => void
> {
  override set<K extends keyof ClientEvents>(
    key: K,
    value: (...args: ClientEvents[K]) => void,
  ): this {
    return super.set(
      key,
      value as (...args: ClientEvents[keyof ClientEvents]) => void,
    );
  }

  override get<K extends keyof ClientEvents>(
    key: K,
  ): ((...args: ClientEvents[K]) => void) | undefined {
    return super.get(key);
  }
}
