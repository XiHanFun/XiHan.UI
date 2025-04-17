import { resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { optimize, type Config } from "svgo";
import { icons } from "../src/source";
import { ASSETS_DIR, ICONS_DIR } from "../src/source/path";
import { toPascalCase, toKebabCase } from "@xihan-ui/utils";
import { sync as globSync } from "glob";

// SVG优化配置
const svgoConfig: Config = {
  plugins: [
    {
      name: "removeAttrs",
      params: {
        attrs: "(id|data-name)",
      },
    },
    {
      name: "convertShapeToPath",
      params: {
        convertArcs: true,
        floatPrecision: 3,
      },
    },
  ],
  multipass: true,
  floatPrecision: 3,
  js2svg: {
    indent: 2,
    pretty: true,
  },
};

// 确保目录存在
function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// 从SVG字符串中提取所有的path路径数据和样式
function extractAllPaths(svgContent: string): { pathData: string; attributes: Record<string, string> } {
  // 提取SVG元素的公共属性
  const svgAttributes: Record<string, string> = {};

  // 查找SVG标签上的样式属性
  const svgMatch = svgContent.match(/<svg[^>]*>/);
  if (svgMatch) {
    const svgTag = svgMatch[0];
    // 提取关键样式属性
    const fillMatch = svgTag.match(/fill="([^"]*)"/);
    const strokeMatch = svgTag.match(/stroke="([^"]*)"/);
    const strokeWidthMatch = svgTag.match(/stroke-width="([^"]*)"/);
    const strokeLinecapMatch = svgTag.match(/stroke-linecap="([^"]*)"/);
    const strokeLinejoinMatch = svgTag.match(/stroke-linejoin="([^"]*)"/);
    const viewBoxMatch = svgTag.match(/viewBox="([^"]+)"/);

    if (fillMatch) svgAttributes.fill = fillMatch[1];
    if (strokeMatch) svgAttributes.stroke = strokeMatch[1];
    if (strokeWidthMatch) svgAttributes["stroke-width"] = strokeWidthMatch[1];
    if (strokeLinecapMatch) svgAttributes["stroke-linecap"] = strokeLinecapMatch[1];
    if (strokeLinejoinMatch) svgAttributes["stroke-linejoin"] = strokeLinejoinMatch[1];
    // 提取并设置viewBox
    if (viewBoxMatch) {
      svgAttributes.viewBox = viewBoxMatch[1];
    } else {
      svgAttributes.viewBox = "0 0 24 24"; // 默认值
    }
  }

  // 仅匹配<path>标签的d属性和样式属性
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
  const paths: string[] = [];
  let match;

  // 如果在path元素上找到重要样式属性，优先使用path元素的属性
  while ((match = pathRegex.exec(svgContent)) !== null) {
    // 提取d属性和样式属性
    const pathTag = match[0];
    const pathD = match[1];

    // 检查当前path标签是否有独特的样式属性
    const fillMatch = pathTag.match(/fill="([^"]*)"/);
    const strokeMatch = pathTag.match(/stroke="([^"]*)"/);
    const strokeWidthMatch = pathTag.match(/stroke-width="([^"]*)"/);
    const strokeLinecapMatch = pathTag.match(/stroke-linecap="([^"]*)"/);
    const strokeLinejoinMatch = pathTag.match(/stroke-linejoin="([^"]*)"/);

    // 如果path有独特的样式，并且不同于SVG全局样式，则优先使用path的样式
    if (fillMatch && fillMatch[1] !== svgAttributes.fill) svgAttributes.fill = fillMatch[1];
    if (strokeMatch && strokeMatch[1] !== svgAttributes.stroke) svgAttributes.stroke = strokeMatch[1];
    if (strokeWidthMatch && strokeWidthMatch[1] !== svgAttributes["stroke-width"])
      svgAttributes["stroke-width"] = strokeWidthMatch[1];
    if (strokeLinecapMatch && strokeLinecapMatch[1] !== svgAttributes["stroke-linecap"])
      svgAttributes["stroke-linecap"] = strokeLinecapMatch[1];
    if (strokeLinejoinMatch && strokeLinejoinMatch[1] !== svgAttributes["stroke-linejoin"])
      svgAttributes["stroke-linejoin"] = strokeLinejoinMatch[1];

    // 清理路径字符串，移除换行和制表符
    let pathData = pathD;
    // 将多行字符串转换为单行，保留空格
    pathData = pathData.replace(/[\r\n\t]+/g, " ");
    // 将连续的多个空格替换为单个空格
    pathData = pathData.replace(/\s{2,}/g, " ");
    paths.push(pathData);
  }

  // 如果没有找到path，检查是否有其他SVG元素并尝试转换
  if (paths.length === 0) {
    const conversion = checkAndConvertOtherSvgElements(svgContent);
    if (conversion) {
      paths.push(conversion);
    }
  }

  // 如果仍然没有找到可转换的元素
  if (paths.length === 0) {
    console.warn("未能找到任何可转换为path的SVG元素");
    return { pathData: "", attributes: {} };
  }

  // 默认属性，如果没有在SVG中找到
  if (!svgAttributes.fill && !svgAttributes.stroke) {
    svgAttributes.fill = "none";
    svgAttributes.stroke = "currentColor";
  }
  if (!svgAttributes["stroke-width"]) {
    svgAttributes["stroke-width"] = "2";
  }
  if (!svgAttributes["stroke-linecap"]) {
    svgAttributes["stroke-linecap"] = "round";
  }
  if (!svgAttributes["stroke-linejoin"]) {
    svgAttributes["stroke-linejoin"] = "round";
  }
  // 确保viewBox属性存在
  if (!svgAttributes.viewBox) {
    svgAttributes.viewBox = "0 0 24 24";
  }

  // 返回所有path组合和样式属性
  return {
    pathData: paths.join(" ").trim(),
    attributes: svgAttributes,
  };
}

// 检查并转换其他常见SVG元素
function checkAndConvertOtherSvgElements(svgContent: string): string {
  console.warn("未找到path元素，尝试转换其他SVG元素");

  // 收集所有转换后的路径
  const paths: string[] = [];
  let match;

  // 检查并转换其他常见SVG元素
  // 1. 矩形 <rect>
  const rectRegex =
    /<rect[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*(?:rx="([^"]*)")?[^>]*(?:ry="([^"]*)")?[^>]*\/?\s*>/g;
  while ((match = rectRegex.exec(svgContent)) !== null) {
    const [, x, y, width, height, rx, ry] = match;
    const r = rx || ry || "0";
    // 转换为path表示
    if (parseFloat(r) > 0) {
      // 带圆角的矩形
      paths.push(
        `M${parseFloat(x) + parseFloat(r)},${y} h${parseFloat(width) - 2 * parseFloat(r)} q${r},0 ${r},${r} v${parseFloat(height) - 2 * parseFloat(r)} q0,${r} -${r},${r} h-${parseFloat(width) - 2 * parseFloat(r)} q-${r},0 -${r},-${r} v-${parseFloat(height) - 2 * parseFloat(r)} q0,-${r} ${r},-${r} z`,
      );
    } else {
      // 普通矩形
      paths.push(`M${x},${y} h${width} v${height} h-${width} z`);
    }
  }

  // 2. 圆形 <circle>
  const circleRegex = /<circle[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*r="([^"]*)"[^>]*\/?\s*>/g;
  while ((match = circleRegex.exec(svgContent)) !== null) {
    const [, cx, cy, r] = match;
    const numR = parseFloat(r);
    // 转换为path表示（近似表示圆形）
    paths.push(`M${cx},${parseFloat(cy) - numR} a${r},${r} 0 1,0 ${numR * 2},0 a${r},${r} 0 1,0 -${numR * 2},0 z`);
  }

  // 3. 椭圆 <ellipse>
  const ellipseRegex = /<ellipse[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*rx="([^"]*)"[^>]*ry="([^"]*)"[^>]*\/?\s*>/g;
  while ((match = ellipseRegex.exec(svgContent)) !== null) {
    const [, cx, cy, rx, ry] = match;
    const numRx = parseFloat(rx);
    const numRy = parseFloat(ry);
    // 转换为path表示
    paths.push(
      `M${cx},${parseFloat(cy) - numRy} a${rx},${ry} 0 1,0 ${numRx * 2},0 a${rx},${ry} 0 1,0 -${numRx * 2},0 z`,
    );
  }

  // 4. 线段 <line>
  const lineRegex = /<line[^>]*x1="([^"]*)"[^>]*y1="([^"]*)"[^>]*x2="([^"]*)"[^>]*y2="([^"]*)"[^>]*\/?\s*>/g;
  while ((match = lineRegex.exec(svgContent)) !== null) {
    const [, x1, y1, x2, y2] = match;
    // 转换为path表示
    paths.push(`M${x1},${y1} L${x2},${y2}`);
  }

  // 5. 折线 <polyline>
  const polylineRegex = /<polyline[^>]*points="([^"]*)"[^>]*\/?\s*>/g;
  while ((match = polylineRegex.exec(svgContent)) !== null) {
    const [, points] = match;
    const pointPairs = points.trim().split(/\s+|,/);
    if (pointPairs.length >= 2) {
      let pathData = `M${pointPairs[0]},${pointPairs[1]}`;
      for (let i = 2; i < pointPairs.length; i += 2) {
        if (i + 1 < pointPairs.length) {
          pathData += ` L${pointPairs[i]},${pointPairs[i + 1]}`;
        }
      }
      paths.push(pathData);
    }
  }

  // 6. 多边形 <polygon>
  const polygonRegex = /<polygon[^>]*points="([^"]*)"[^>]*\/?\s*>/g;
  while ((match = polygonRegex.exec(svgContent)) !== null) {
    const [, points] = match;
    const pointPairs = points.trim().split(/\s+|,/);
    if (pointPairs.length >= 2) {
      let pathData = `M${pointPairs[0]},${pointPairs[1]}`;
      for (let i = 2; i < pointPairs.length; i += 2) {
        if (i + 1 < pointPairs.length) {
          pathData += ` L${pointPairs[i]},${pointPairs[i + 1]}`;
        }
      }
      pathData += " Z"; // 闭合路径
      paths.push(pathData);
    }
  }

  // 如果没有找到可转换的元素
  if (paths.length === 0) {
    console.warn("未能找到任何可转换为path的SVG元素");
    return "";
  }

  // 返回所有路径的集合（多个path用空格分隔，符合SVG path规范）
  return paths.join(" ").trim();
}

// 使用 glob 模式匹配文件
function findSvgFilesByPattern(baseDir: string, pattern: string): string[] {
  try {
    // 使用globSync匹配文件
    const matches = globSync(pattern, {
      cwd: baseDir, // 设置当前工作目录
      absolute: false, // 返回相对路径
      nodir: true, // 不包含目录
    });

    // 确保所有路径使用统一的分隔符格式
    return matches.map(path => path.replace(/\\/g, "/"));
  } catch (error) {
    console.error(`匹配文件模式 "${pattern}" 时出错:`, error);
    return [];
  }
}

// 生成图标模块内容
function generateIconModule(
  exportName: string,
  declareName: string,
  pathData: string,
  attributes: Record<string, string>,
): string {
  return `
export const ${exportName} = defineComponent<IconBaseProps>({
  name: "${declareName}",
  setup(props) {
    return () => h(IconBase, { path: "${pathData}", attributes: ${JSON.stringify(attributes)} });
  },
});
`;
}

// 生成主索引文件
function generateMainIndexFile(): void {
  let mainIndexContent = `
/**
 * 此文件由图标生成脚本自动更新
 */

${icons
  .map(iconSet => {
    let iconContent = "";
    if (existsSync(ICONS_DIR) && existsSync(resolve(ICONS_DIR, `${iconSet.id}.ts`))) {
      iconContent = `export * from "./${iconSet.id}";`;
      iconContent += `
import { ${iconSet.id}Name, ${iconSet.id}DisplayName, ${iconSet.id}Count, ${iconSet.id}Components } from "./${iconSet.id}";
`;
    } else {
      iconContent = `// 图标集 ${iconSet.id} 未生成`;
    }
    return iconContent;
  })
  .join("\n")}
`;

  mainIndexContent += `
export const Icons = [
  ${icons
    .map(iconSet => {
      return ` { name: ${iconSet.id}Name, displayName: ${iconSet.id}DisplayName, count: ${iconSet.id}Count, components: ${iconSet.id}Components },`;
    })
    .join("\n")}
];
`;

  writeFileSync(resolve(ICONS_DIR, "index.ts"), mainIndexContent);
}

// 主函数
async function generate() {
  try {
    // 先删除旧的图标文件
    if (existsSync(ICONS_DIR)) {
      rmSync(ICONS_DIR, { recursive: true, force: true });
    }
    // 再创建新的图标文件
    ensureDir(ICONS_DIR);

    // 处理每个图标集;
    for (const iconSet of icons) {
      console.log("正在生成", iconSet.id, "...");

      // 生成单个文件
      let singleContent = `
// 自动生成的图标，请勿手动修改
import { defineComponent, h } from "vue";
import IconBase, { type IconBaseProps } from "../components/IconBase";
`;

      const iconName = iconSet.id;
      const iconDisplayName = iconSet.name;
      const iconComponents = [];
      let iconCount = 0;
      for (const content of iconSet.contents) {
        const iconPath = resolve(ASSETS_DIR, iconSet.source.localName, iconSet.source.subFolders);

        // 使用fileFilter匹配SVG文件
        const iconFilePaths = findSvgFilesByPattern(iconPath, content.fileFilter);

        if (iconFilePaths.length === 0) {
          console.warn(`警告: 在 ${iconPath} 中未找到与模式 "${content.fileFilter}" 匹配的 SVG 文件`);
          continue;
        }

        console.log(`在 ${iconPath} 中找到 ${iconFilePaths.length} 个与模式 "${content.fileFilter}" 匹配的SVG文件`);

        // 转换每个SVG文件
        for (const relativePath of iconFilePaths) {
          try {
            // 获取文件名（不含路径和扩展名）
            const fileName = relativePath.split(/[/\\]/).pop() || "";
            const baseName = fileName.replace(".svg", "");

            // 添加安全检查，确保文件名不包含路径分隔符
            if (baseName.includes("/") || baseName.includes("\\")) {
              console.warn(`警告: 文件名 ${baseName} 包含路径分隔符，可能导致问题`);
            }

            // 调用格式化器前做进一步清理
            const name = content.formatter(baseName);
            const cleanBaseName = name.replace(/[\/\\:*?"<>|]/g, "_");

            // 导出名称为大驼峰命名
            const exportName = toPascalCase(cleanBaseName);
            // 声明名称为中划线命名
            const declareName = toKebabCase(cleanBaseName);

            // 使用完整路径读取SVG内容
            const svgContent = readFileSync(resolve(iconPath, relativePath), "utf-8");

            const optimizedSvg = optimize(svgContent, svgoConfig);
            if ("data" in optimizedSvg) {
              const { pathData, attributes } = extractAllPaths(optimizedSvg.data);

              // 如果没有找到path路径，记录警告并继续
              if (!pathData) {
                console.warn(`警告: 在图标 ${fileName} 中未找到path数据`);
                continue;
              }

              const iconContent = generateIconModule(exportName, declareName, pathData, attributes);
              iconComponents.push(exportName);
              singleContent += iconContent;
            }
          } catch (fileError) {
            console.error(`处理文件 ${relativePath} 时出错:`, fileError);
            // 继续处理下一个文件
          }
        }

        iconCount += iconFilePaths.length;
      }

      // 生成名称和数量
      // { name: "fi", displayName: "Feather Icons", count: 287 },
      singleContent += `
export const ${iconName}Name = "${iconName}";
export const ${iconName}DisplayName = "${iconDisplayName}";
export const ${iconName}Count = ${iconCount};
export const ${iconName}Components = [
  ${iconComponents.join(",\n  ")}
];
`;

      // 生成子索引文件
      writeFileSync(resolve(ICONS_DIR, `${iconSet.id}.ts`), singleContent);
    }

    // 生成主索引文件
    generateMainIndexFile();

    console.log("Icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generate();
