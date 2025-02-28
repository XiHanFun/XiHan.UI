import { resolve } from "path";
import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { getDirname } from "../src/utils/path";
import type { IconDefinition } from "../src/utils/creator";

// 修改导入路径
import { icons } from "../src";

const ICONS_DIR = resolve(getDirname(import.meta.url), "../assets");

interface SourceConfig {
  type: "git";
  localName: string;
  url: string;
  branch: string;
  hash: string;
}

interface IconConfig extends IconDefinition {
  source?: SourceConfig;
}

async function downloadRepo(source: SourceConfig) {
  const repoPath = resolve(ICONS_DIR, source.localName);

  try {
    if (!existsSync(repoPath)) {
      // 克隆仓库
      console.log(`Cloning ${source.url}...`);
      execSync(`git clone --depth 1 -b ${source.branch} ${source.url} ${repoPath}`);
    }

    // 切换到指定的 commit
    console.log(`Checking out ${source.hash}...`);
    execSync(`cd ${repoPath} && git fetch --depth 1 origin ${source.hash} && git checkout ${source.hash}`);

    console.log(`Successfully downloaded ${source.localName}`);
  } catch (error) {
    console.error(`Error downloading ${source.localName}:`, error);
    throw error;
  }
}

async function downloadAll() {
  try {
    // 创建图标目录
    if (!existsSync(ICONS_DIR)) {
      mkdirSync(ICONS_DIR, { recursive: true });
    }

    // 下载所有图标库
    for (const icon of icons as IconConfig[]) {
      if (icon.source?.type === "git") {
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
