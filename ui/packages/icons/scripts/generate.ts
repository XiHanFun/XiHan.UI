import { dirInit, writeIconModule, finalizeBuild } from "./tasks";
import { icons } from "../source";

/**
 * 主函数
 */
async function generate() {
  try {
    console.log("开始生成图标...");

    // 初始化目录结构
    await dirInit();

    // 处理每个图标集
    for (const iconSet of icons) {
      console.log(`正在处理图标集: ${iconSet.name} (${iconSet.id})`);
      await writeIconModule(iconSet);
    }

    // 完成构建
    await finalizeBuild();

    console.log("图标生成完成！");
  } catch (error) {
    console.error("生成图标时出错:", error);
    process.exit(1);
  }
}

generate();
