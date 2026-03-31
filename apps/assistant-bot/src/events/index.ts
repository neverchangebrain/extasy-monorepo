import { Events } from "discord.js";

import { ClientEventsMap } from "@extasy/core";

import { interactionCreate } from "./interaction-create";
import { startupClient } from "./ready";

export const clientEvents = new ClientEventsMap();

clientEvents.set(Events.ClientReady, startupClient);
clientEvents.set(Events.InteractionCreate, interactionCreate);
