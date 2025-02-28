import { resolve } from "path";
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import type { SourceConfig, IconSource } from "../src/source/creator";
import { ASSETS_DIR, ICONS_DIR } from "../src/utils/path";

// 修改导入路径
import { icons } from "../src/source";

interface IconConfig extends IconSource {
  source?: SourceConfig;
}

// 拉取仓库最新提交，并重新写入 hash
async function updateRepoHash() {
  try {
    for (const icon of icons as IconConfig[]) {
      if (icon.source?.type === "git") {
        console.log(`正在更新 ${icon.name} 的 hash...`);
        // 只获取最近一次提交的 hash 而不拉取仓库
        const repoUrl = icon.source.url;
        const repoHash = icon.source.hash;
        const repoBranch = icon.source.branch;
        const gitOutput = execSync(`git ls-remote ${repoUrl} ${repoBranch}`).toString().trim();
        // 提取第一列（hash值）
        const repoNewHash = gitOutput.split(/\s+/)[0];
        if (repoNewHash !== repoHash) {
          console.log(`${icon.name} 的 hash 已更新: ${repoNewHash}`);
          icon.source.hash = repoNewHash;
        } else {
          console.log(`${icon.name} 已是最新提交`);
        }
      }
    }

    const indexContent = `
import { getIconPath } from "../utils/path";
import type { IconSource } from "./creator";
import { stringFormatUtils } from "@xihan-ui/utils";

export const icons : IconSource[] = ${JSON.stringify(icons, null, 2)};
`;

    console.log(`准备写入文件: ${resolve(ICONS_DIR, "index.ts")}`);
    writeFileSync(resolve(ICONS_DIR, "index.ts"), indexContent);
    console.log("图标源更新成功！");
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
