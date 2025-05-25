import { resolve, dirname } from "path";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import type { IconSource } from "../source/type";
import { SOURCE_PACKS_DIR } from "../source/path";
import AdmZip from "adm-zip";
import { icons } from "../source";

/**
 * 下载图标包
 * @param source 图标包配置
 */
async function downloadPacks(source: IconSource) {
  const packPath = resolve(SOURCE_PACKS_DIR, source.localName);

  try {
    if (!existsSync(packPath)) {
      console.log(`正在下载 ${source.downloadUrl}...`);

      // 下载图标包 zip 文件
      const response = await fetch(source.downloadUrl);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 使用 adm-zip 解压 ZIP 文件
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();

      if (!zipEntries || zipEntries.length === 0) {
        throw new Error("ZIP 文件为空或无效");
      }

      // 检测是否有统一的根目录
      let commonRoot = "";
      const firstEntry = zipEntries.find(entry => !entry.isDirectory);
      if (firstEntry) {
        const parts = firstEntry.entryName.split("/");
        if (parts.length > 1) {
          const potentialRoot = parts[0];
          const allHaveSameRoot = zipEntries.every(
            entry => entry.entryName.startsWith(potentialRoot + "/") || entry.entryName === potentialRoot,
          );
          if (allHaveSameRoot) {
            commonRoot = potentialRoot + "/";
            console.log(`检测到根目录: ${potentialRoot}，将跳过该层级`);
          }
        }
      }

      // 创建目标目录
      mkdirSync(packPath, { recursive: true });

      // 解压文件，跳过根目录
      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          let targetPath = entry.entryName;

          // 如果有统一根目录，跳过它
          if (commonRoot && targetPath.startsWith(commonRoot)) {
            targetPath = targetPath.substring(commonRoot.length);
          }

          // 跳过空路径
          if (!targetPath) continue;

          const filePath = resolve(packPath, targetPath);
          const fileDir = dirname(filePath);

          // 确保文件夹存在
          if (!existsSync(fileDir)) {
            mkdirSync(fileDir, { recursive: true });
          }

          // 写入文件
          const fileData = entry.getData();
          writeFileSync(filePath, fileData);
        }
      }

      console.log(`成功下载 ${source.localName}`);
    } else {
      console.log(`资源目录 ${packPath} 已存在，跳过下载...`);
    }
  } catch (error) {
    console.error(`下载 ${source.localName} 时出错:`, error);
    throw error;
  }
}

/**
 * 主函数：下载所有图标包
 */
async function downloadAll() {
  console.log("开始下载图标包...");

  // 创建图标包目录
  if (!existsSync(SOURCE_PACKS_DIR)) {
    mkdirSync(SOURCE_PACKS_DIR, { recursive: true });
  }

  for (const iconPack of icons) {
    try {
      await downloadPacks(iconPack.source);
    } catch (error) {
      console.error(`下载图标包 ${iconPack.name} 失败:`, error);
      // 继续下载其他包
    }
  }

  console.log("图标包下载完成！");
}

// 运行下载
downloadAll().catch(error => {
  console.error("下载过程中发生错误:", error);
  process.exit(1);
});
