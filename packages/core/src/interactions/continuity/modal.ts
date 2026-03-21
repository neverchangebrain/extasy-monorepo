import { ModalSubmitInteraction } from 'discord.js';

import { continuity, db } from '@extasy/db';
import { z } from 'zod';

import type { CoreClient } from '../../client';

export type ModalContinuityHandler<T = any> = (ctx: {
  interaction: ModalSubmitInteraction;
  client: CoreClient;
  data: T;
}) => Promise<void>;

export abstract class BaseContinuityModal<T> {
  static decodeCustomId(customId: string) {
    const [name, id] = customId.split(':');

    if (!name || !id) {
      throw new Error(`invalid custom id: ${customId}`);
    }

    return { name, id };
  }

  public encodeCustomId(id: string) {
    return `${this.metadata.name}:${id}`;
  }

  public handler: ModalContinuityHandler<T> | undefined = undefined;

  constructor(
    public schema: z.ZodType<T>,
    public metadata: { name: string },
  ) {}

  public async getContext(id: string): Promise<T> {
    const result = await db.query.continuity.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    });

    if (!result) {
      throw new Error(
        `No data found for continuity in db (${this.metadata.name}:${id})`,
      );
    }

    try {
      return this.schema.parse(result.data);
    } catch {
      throw new Error(
        `Got invalid continuity data from db, validation failed:\n${JSON.stringify(result.data, null, 2)}`,
      );
    }
  }

  public async create(data: T) {
    const result = await db
      .insert(continuity)
      .values({ name: this.metadata.name, data })
      .returning()
      .then((rows) => rows[0]);

    if (!result) {
      throw new Error(
        `Failed to create continuity context (${this.metadata.name})`,
      );
    }

    const customId = this.encodeCustomId(result.id);

    return {
      id: result.id,
      name: result.name,
      customId,
    };
  }
}
