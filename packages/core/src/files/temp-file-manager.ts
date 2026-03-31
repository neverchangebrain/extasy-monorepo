import { logger } from "@extasy/logger";
import * as fs from "node:fs";
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from "path";

import { TIME } from "../constants/time";
import { env } from "../env";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TempFileManager {
  static tempDirPath = env.TEMP_DIR_PATH;
  static removeAfter = TIME.MINUTE * 15;

  static cleanup() {
    try {
      if (!fs.existsSync(TempFileManager.tempDirPath)) {
        logger.debug(
          `temp directory does not exist, creating: ${TempFileManager.tempDirPath}`,
        );

        fs.mkdirSync(TempFileManager.tempDirPath, { recursive: true });
      } else {
        logger.debug(`clearing temp directory: ${TempFileManager.tempDirPath}`);

        fs.rmSync(TempFileManager.tempDirPath, { recursive: true });
        fs.mkdirSync(TempFileManager.tempDirPath);
      }
    } catch (error) {
      logger.error(`failed to create temp directory: ${error}`);
    }
  }

  static create(id?: string) {
    const dir = id ?? Bun.randomUUIDv7();
    const subTempDir = path.join(TempFileManager.tempDirPath, dir);

    logger.debug(`creating temp directory: ${subTempDir}`);

    if (!fs.existsSync(subTempDir)) fs.mkdirSync(subTempDir);

    setTimeout(() => {
      if (!fs.existsSync(subTempDir)) return;
      logger.debug(`auto-removing temp directory: ${subTempDir}`);
      fs.rmSync(subTempDir, { recursive: true });
    }, TempFileManager.removeAfter);

    return subTempDir;
  }

  static remove(id: string) {
    const subTempDir = path.join(TempFileManager.tempDirPath, id);

    if (!fs.existsSync(subTempDir)) {
      return;
    }

    fs.rmSync(subTempDir, { recursive: true });
    logger.debug(`removed temp directory manually: ${subTempDir}`);
  }
}
