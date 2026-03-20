import { logger } from '@extasy/logger';
import * as fs from 'fs';
import path from 'path';

import { TIME } from '../constants/time';
import { env } from '../env';

export class TempFileManager {
  static tempDirPath = env.TEMP_DIR_PATH;
  static removeAfter = TIME.MINUTE * 15;

  static cleanup() {
    try {
      if (!fs.existsSync(this.tempDirPath)) {
        logger.debug(
          `temp directory does not exist, creating: ${this.tempDirPath}`,
        );

        fs.mkdirSync(this.tempDirPath, { recursive: true });
      } else {
        logger.debug(`clearing temp directory: ${this.tempDirPath}`);

        fs.rmSync(this.tempDirPath, { recursive: true });
        fs.mkdirSync(this.tempDirPath);
      }
    } catch (error) {
      logger.error(`failed to create temp directory: ${error}`);
    }
  }

  static create(id?: string) {
    const dir = id ?? Bun.randomUUIDv7();
    const subTempDir = path.join(this.tempDirPath, dir);

    logger.debug(`creating temp directory: ${subTempDir}`);

    if (!fs.existsSync(subTempDir)) fs.mkdirSync(subTempDir);

    setTimeout(() => {
      if (!fs.existsSync(subTempDir)) return;
      logger.debug(`auto-removing temp directory: ${subTempDir}`);
      fs.rmSync(subTempDir, { recursive: true });
    }, this.removeAfter);

    return subTempDir;
  }

  static remove(id: string) {
    const subTempDir = path.join(this.tempDirPath, id);

    if (!fs.existsSync(subTempDir)) {
      return;
    }

    fs.rmSync(subTempDir, { recursive: true });
    logger.debug(`removed temp directory manually: ${subTempDir}`);
  }
}
