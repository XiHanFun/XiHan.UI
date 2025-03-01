import { resolve } from "path";
import { execSync } from "child_process";
import { writeFileSync, readFileSync } from "fs";
import type { SourceConfig, IconSource } from "../src/utils/creator";
import { getSourcePath } from "../src/utils/path";

// 修改导入路径
import { icons } from "../src/source";

interface IconConfig extends IconSource {
  source: SourceConfig;
}

// 拉取仓库最新提交，并只更新 hash 值
async function updateRepoHash() {
  try {
    // 记录更新的 hash 值
    const hashUpdates: Record<string, { oldHash: string; newHash: string }> = {};
    let hasUpdates = false;

    for (const icon of icons as IconConfig[]) {
      if (icon.source.type === "git") {
        console.log(`正在更新 ${icon.name} 的 hash...`);
        // 只获取最近一次提交的 hash 而不拉取仓库
        const repoUrl = icon.source.url;
        const repoHash = icon.source.hash;
        const repoBranch = icon.source.branch;
        const gitOutput = execSync(`git ls-remote ${repoUrl} ${repoBranch}`).toString().trim();
        // 提取第一列（hash值）
        const repoNewHash = gitOutput.split(/\s+/)[0];
        if (repoNewHash !== repoHash) {
          console.log(`${icon.name} 的 hash 已更新: ${repoHash} -> ${repoNewHash}`);
          hashUpdates[repoUrl] = {
            oldHash: repoHash,
            newHash: repoNewHash,
          };
          icon.source.hash = repoNewHash;
          hasUpdates = true;
        } else {
          console.log(`${icon.name} 已是最新提交`);
        }
      }
    }

    // 如果有更新，则修改文件
    if (hasUpdates) {
      // 读取原始文件内容
      const indexFilePath = getSourcePath("index.ts");
      const fileContent = readFileSync(indexFilePath, "utf-8");

      // 按行分割文件内容
      const lines = fileContent.split("\n");

      // 逐行检查并替换包含特定 hash 的行
      const updatedLines = lines.map(line => {
        // 遍历所有需要更新的 hash
        for (const { oldHash, newHash } of Object.values(hashUpdates)) {
          // 如果该行包含旧的 hash 值
          if (line.includes(`hash: "${oldHash}"`)) {
            // 直接替换整行中的 hash 值
            return line.replace(`hash: "${oldHash}"`, `hash: "${newHash}"`);
          }
        }
        // 如果不包含需要更新的 hash，保持原样
        return line;
      });

      // 重新组合文件内容
      const updatedContent = updatedLines.join("\n");

      // 写回文件
      console.log(`准备更新文件: ${indexFilePath}`);
      writeFileSync(indexFilePath, updatedContent);
      console.log("图标源 hash 更新成功！");
    } else {
      console.log("所有图标源已是最新状态，无需更新。");
    }
  } catch (error) {
    console.error("更新图标源时发生错误:", error);
    process.exit(1);
  }
}

// 正确处理异步函数
updateRepoHash().catch(error => {
  console.error("运行过程中发生错误:", error);
  process.exit(1);
});
