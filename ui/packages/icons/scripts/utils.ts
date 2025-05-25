import { sync as globSync } from "glob";
import { optimizeSVG } from "./optimizeSVG";
import type { IconDefinition } from "../src/components/IconDefinition";

/**
 * 获取图标文件列表
 */
export async function getIconFiles(basePath: string, fileFilter: string): Promise<string[]> {
  try {
    const files = globSync(fileFilter, {
      cwd: basePath,
      absolute: false,
      nodir: true,
    });

    return files.sort((a, b) => {
      const nameA = a.substring(a.lastIndexOf("/") + 1);
      const nameB = b.substring(b.lastIndexOf("/") + 1);
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error(`获取图标文件失败: ${error}`);
    return [];
  }
}

/**
 * 转换 SVG 为图标定义
 */
export async function convertSVG(
  scale: number = 1,
  declareName: string,
  prefix: string,
  svg: string,
): Promise<IconDefinition> {
  try {
    // 使用 SVGO 优化 SVG
    const optimized = optimizeSVG(svg);

    if (!("data" in optimized)) {
      throw new Error("SVG 优化失败");
    }

    const optimizedSvg = optimized.data;

    // 提取 SVG 内容（去除 svg 标签）
    const raw = optimizedSvg.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1] || "";

    const data: IconDefinition = {
      name: declareName,
      raw: raw.trim(),
    };

    return data;
  } catch (error) {
    console.error(`转换 SVG 失败 (${declareName}):`, error);
    throw error;
  }
}
