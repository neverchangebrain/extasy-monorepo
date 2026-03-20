import type { ContinuityToken } from './types';

const SEP = ':';

export const encodeContinuityToken = (token: ContinuityToken) =>
  `${token.name}${SEP}${token.id}`;

export const decodeContinuityToken = (
  customId: string,
): ContinuityToken | null => {
  const idx = customId.indexOf(SEP);

  if (idx <= 0) {
    return null;
  }

  const name = customId.slice(0, idx);
  const id = customId.slice(idx + 1);

  if (!name || !id) {
    return null;
  }

  return { name, id };
};

export const getCustomIdPrefix = (customId: string) =>
  customId.split(SEP)[0] ?? customId;
