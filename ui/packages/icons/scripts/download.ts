import { resolve } from "path";
import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import type { IconSource, IconPack } from "../src/source/type";
import { PACKS_DIR } from "../src/source/path";
import { unzip } from "@xihan-ui/utils";
// 修改导入路径
import { icons } from "../src/source";

/**
 * 下载图标包
 * @param source 图标包配置
 */
async function downloadPacks(source: IconSource) {
  const packPath = resolve(PACKS_DIR, source.localName);

  try {
    if (!existsSync(packPath)) {
      // 下载图标包 zip 文件
      console.log(`Downloading ${source.downloadUrl}...`);
      const response = await fetch(source.downloadUrl);
      const blob = await response.blob();
      // 解压 zip 文件中的 subFolders 到 localName 目录
      const files = await unzip(blob, { includeFolders: true });
      for (const file of files.values()) {
        const filePath = resolve(packPath, file.name);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, file);
      }

      console.log(`Successfully downloaded ${source.localName}`);
    } else {
      console.log(`Assets directory ${packPath} already exists, skipping download...`);
    }
  } catch (error) {
    console.error(`Error downloading ${source.localName}:`, error);
    throw error;
  }
}
