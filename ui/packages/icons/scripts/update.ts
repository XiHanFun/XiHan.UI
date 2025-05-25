#!/usr/bin/env node

import { execSync } from "child_process";
import { resolve } from "path";

/**
 * 执行命令并打印输出
 */
function runCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, {
      stdio: "inherit",
      cwd: resolve(__dirname, ".."),
    });
    console.log(`✅ ${description} 完成`);
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error);
    throw error;
  }
}

/**
 * 主更新流程
 */
async function updateIcons() {
  console.log("🚀 开始更新图标包...");

  try {
    // 1. 下载图标包
    runCommand("tsx scripts/download.ts", "下载图标包");

    // 2. 生成图标组件
    runCommand("tsx scripts/generate.ts", "生成图标组件");

    // 3. 构建图标包
    runCommand("pnpm build", "构建图标包");

    console.log("\n🎉 图标包更新完成！");
  } catch (error) {
    console.error("\n💥 更新过程中出现错误:", error);
    process.exit(1);
  }
}

// 运行更新
updateIcons();
