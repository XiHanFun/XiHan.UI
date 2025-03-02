import { resolve } from "path";
import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import type { SourceConfig, IconSource } from "../src/utils/creator";
import { ASSETS_DIR, ICONS_DIR } from "../src/utils/path";

// 修改导入路径
import { icons } from "../src/source";

// 图标库配置
interface IconConfig extends IconSource {
  source: SourceConfig;
}

/**
 * 下载仓库
 * @param source 仓库配置
 */
async function downloadRepo(source: SourceConfig) {
  const repoPath = resolve(ASSETS_DIR, source.localName);

  try {
    if (!existsSync(repoPath)) {
      // 克隆仓库
      console.log(`Cloning ${source.url}...`);
      execSync(`git clone --depth 1 -b ${source.branch} ${source.url} ${repoPath}`);

      // 切换到指定的 commit
      console.log(`Checking out ${source.hash}...`);
      execSync(`cd ${repoPath} && git fetch --depth 1 origin ${source.hash} && git checkout ${source.hash}`);

      console.log(`Successfully downloaded ${source.localName}`);
    } else {
      console.log(`Assets directory ${repoPath} already exists, skipping download...`);
    }
  } catch (error) {
    console.error(`Error downloading ${source.localName}:`, error);
    throw error;
  }
}

/**
 * 下载所有图标库
 */
async function downloadAll() {
  try {
    // 创建图标目录
    if (!existsSync(ASSETS_DIR)) {
      mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // 下载所有图标库
    for (const icon of icons as IconConfig[]) {
      if (icon.source.type === "git") {
        await downloadRepo(icon.source);
      }
    }

    console.log("All icon libraries downloaded successfully!");
  } catch (error) {
    console.error("Error downloading icon libraries:", error);
    process.exit(1);
  }
}

downloadAll();
