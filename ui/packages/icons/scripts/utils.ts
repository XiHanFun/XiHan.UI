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
 * 清理 SVG 属性，移除不需要的属性
 */
function cleanAttr(attr: Record<string, string>, prefix: string): Record<string, string> {
  const cleanedAttr: Record<string, string> = {};
  const excludeAttrs = ["xmlns", "xmlns:xlink", "xml:space", "width", "height", "version"];

  for (const [key, value] of Object.entries(attr)) {
    if (!excludeAttrs.includes(key) && value) {
      cleanedAttr[key] = value;
    }
  }

  return cleanedAttr;
}

/**
 * 解析 SVG 标签的属性
 */
function parseSvgAttributes(svgTag: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  // 匹配所有属性 key="value" 或 key='value'
  const attrRegex = /(\w+(?::\w+)?)\s*=\s*["']([^"']*)["']/g;
  let match;

  while ((match = attrRegex.exec(svgTag)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
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

    // 提取 SVG 开始标签
    const svgTagMatch = optimizedSvg.match(/<svg[^>]*>/);
    if (!svgTagMatch) {
      throw new Error("无法找到 SVG 标签");
    }

    const svgTag = svgTagMatch[0];

    // 解析 SVG 属性
    const attr = parseSvgAttributes(svgTag);

    // 解析 viewBox
    const viewBoxStr = attr.viewBox || attr.viewbox;

    // 如果没有就继续
    if (!viewBoxStr) {
      throw new Error("SVG 缺少 viewBox 属性");
    }

    const viewBox = viewBoxStr.split(/\s+/).map(Number);
    if (viewBox.length !== 4 || viewBox.some(isNaN)) {
      throw new Error(`无效的 viewBox: ${viewBoxStr}`);
    }

    const [viewBoxMinX, viewBoxMinY, viewBoxWidth, viewBoxHeight] = viewBox;

    // 清理属性
    const cleanedAttr = cleanAttr(attr, prefix);

    // 确保 scale 有效
    if (!scale || scale <= 0) scale = 1;

    // 直接使用原始的 viewBox 值，不进行额外的缩放计算
    const minX = viewBoxMinX;
    const minY = viewBoxMinY;
    const width = viewBoxWidth;
    const height = viewBoxHeight;

    // 提取 SVG 内容（去除 svg 标签）
    const raw = optimizedSvg.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1] || "";

    const data: IconDefinition = {
      name: declareName,
      minX: minX,
      minY: minY,
      width: width,
      height: height,
      raw: raw.trim(),
    };

    // 如果有额外属性，添加到数据中
    if (Object.keys(cleanedAttr).length > 0) {
      data.attr = cleanedAttr;
    }

    return data;
  } catch (error) {
    console.error(`转换 SVG 失败 (${declareName}):`, error);

    // 降级处理：如果解析失败，返回基本的图标定义
    const optimized = optimizeSVG(svg);
    const optimizedSvg = "data" in optimized ? optimized.data : svg;
    const raw = optimizedSvg.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1] || "";

    return {
      name: declareName,
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
      raw: raw.trim(),
    };
  }
}
