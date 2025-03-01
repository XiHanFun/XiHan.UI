import { resolve, join } from "path";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { optimize, type Config } from "svgo";
import { icons } from "../src/source";
import { ASSETS_DIR, ICONS_DIR } from "../src/utils/path";
import { stringFormatUtils } from "@xihan-ui/utils";

// SVG优化配置
const svgoConfig: Config = {
  plugins: [
    {
      name: "removeAttrs",
      params: {
        attrs: "(fill|stroke|stroke-width|id|data-name)",
      },
    },
    {
      name: "removeViewBox",
      active: false,
    } as any, // 临时解决类型错误
    {
      name: "removeDimensions",
      active: true,
    },
    {
      name: "mergePaths",
      active: false,
    },
    {
      name: "convertShapeToPath",
      active: true,
      params: {
        // 确保转换所有形状
        shapeElements: ["rect", "circle", "ellipse", "line", "polyline", "polygon"],
      },
    },
  ],
  // 添加必要的配置
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

/**
 * 从SVG字符串中提取所有的path路径数据
 * @param svgContent SVG内容字符串
 * @returns 组合后的path路径字符串
 */
function extractAllPaths(svgContent: string): string {
  // 仅匹配<path>标签的d属性
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
  const paths: string[] = [];
  let match;

  while ((match = pathRegex.exec(svgContent)) !== null) {
    // 确保只提取d属性的值
    // 清理路径字符串，移除换行和制表符
    let pathData = match[1];
    // 将多行字符串转换为单行，保留空格
    pathData = pathData.replace(/[\r\n\t]+/g, " ");
    // 将连续的多个空格替换为单个空格
    pathData = pathData.replace(/\s{2,}/g, " ");
    paths.push(pathData);
  }

  // 如果没有找到path，检查是否有其他SVG元素并尝试转换
  if (paths.length === 0) {
    console.warn("未找到path元素，尝试转换其他SVG元素");

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
          `M${parseFloat(x) + parseFloat(r)},${y} h${parseFloat(width) - 2 * parseFloat(r)} q${r},0 ${r},${r} v${parseFloat(height) - 2 * parseFloat(r)} q0,${r} -${r},${r} h-${parseFloat(width) - 2 * parseFloat(r)} q-${r},0 -${r},-${r} v-${parseFloat(height) - 2 * parseFloat(r)} q0,-${r} ${r},-${r} z`
        );
      } else {
        // 普通矩形
        paths.push(`M${x},${y} h${width} v${height} h-${width} z`);
      }
      console.log("转换rect为path");
    }

    // 2. 圆形 <circle>
    const circleRegex = /<circle[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*r="([^"]*)"[^>]*\/?\s*>/g;
    while ((match = circleRegex.exec(svgContent)) !== null) {
      const [, cx, cy, r] = match;
      const numR = parseFloat(r);
      // 转换为path表示（近似表示圆形）
      paths.push(`M${cx},${parseFloat(cy) - numR} a${r},${r} 0 1,0 ${numR * 2},0 a${r},${r} 0 1,0 -${numR * 2},0 z`);
      console.log("转换circle为path");
    }

    // 3. 椭圆 <ellipse>
    const ellipseRegex = /<ellipse[^>]*cx="([^"]*)"[^>]*cy="([^"]*)"[^>]*rx="([^"]*)"[^>]*ry="([^"]*)"[^>]*\/?\s*>/g;
    while ((match = ellipseRegex.exec(svgContent)) !== null) {
      const [, cx, cy, rx, ry] = match;
      const numRx = parseFloat(rx);
      const numRy = parseFloat(ry);
      // 转换为path表示
      paths.push(
        `M${cx},${parseFloat(cy) - numRy} a${rx},${ry} 0 1,0 ${numRx * 2},0 a${rx},${ry} 0 1,0 -${numRx * 2},0 z`
      );
      console.log("转换ellipse为path");
    }

    // 4. 线段 <line>
    const lineRegex = /<line[^>]*x1="([^"]*)"[^>]*y1="([^"]*)"[^>]*x2="([^"]*)"[^>]*y2="([^"]*)"[^>]*\/?\s*>/g;
    while ((match = lineRegex.exec(svgContent)) !== null) {
      const [, x1, y1, x2, y2] = match;
      // 转换为path表示
      paths.push(`M${x1},${y1} L${x2},${y2}`);
      console.log("转换line为path");
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
        console.log("转换polyline为path");
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
        console.log("转换polygon为path");
      }
    }
  }

  // 如果仍然没有找到可转换的元素
  if (paths.length === 0) {
    console.warn("未能找到任何可转换为path的SVG元素");
    return "";
  }

  // 输出调试信息
  // if (paths.length > 1) {
  //   console.log(`发现多路径SVG，共有 ${paths.length} 个路径`);
  // }

  // 返回所有path组合（多个path用空格分隔，符合SVG path规范）
  // 确保最终返回的整个字符串也是单行的
  return paths.join(" ").trim();
}

/**
 * 递归搜索目录下所有SVG文件
 * @param dir 要搜索的目录
 * @param baseDir 基础目录(用于计算相对路径)
 * @returns SVG文件路径列表，包含相对于baseDir的路径
 */
function findAllSvgFiles(dir: string, baseDir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });

  let results: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = fullPath.slice(baseDir.length + 1); // +1 是为了去掉开头的路径分隔符

    if (entry.isDirectory()) {
      // 递归搜索子目录
      results = results.concat(findAllSvgFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".svg")) {
      // 添加SVG文件路径
      results.push(relativePath);
    }
  }

  return results;
}

// 主函数
async function generate() {
  try {
    ensureDir(ICONS_DIR);

    // 处理每个图标集;
    for (const iconSet of icons) {
      console.log("正在生成", iconSet.id, "...");
      const iconSetDir = resolve(ICONS_DIR, iconSet.id);
      ensureDir(iconSetDir);

      for (const content of iconSet.contents) {
        const iconPath = resolve(ASSETS_DIR, iconSet.source.localName, iconSet.source.remoteDir);

        // 递归获取所有svg文件，包括子文件夹中的
        const iconFilePaths = findAllSvgFiles(iconPath, iconPath);

        if (iconFilePaths.length === 0) {
          console.warn(`警告: 在 ${iconPath} 及其子文件夹中未找到 SVG 文件`);
          continue;
        }

        console.log(`在 ${iconPath} 中找到 ${iconFilePaths.length} 个SVG文件`);

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
            const cleanBaseName = baseName.replace(/[\/\\:*?"<>|]/g, "_");
            const name = content.formatter(cleanBaseName);

            // 导出名称为大驼峰命名
            const exportName = stringFormatUtils.toPascalCase(name);
            // 声明名称为中划线命名
            const declareName = stringFormatUtils.toKebabCase(name);
            // 文件路径名称为下划线命名
            const iconFilePathName = stringFormatUtils.toSnakeCase(name);

            // 使用完整路径读取SVG内容
            const svgContent = readFileSync(resolve(iconPath, relativePath), "utf-8");

            const result = optimize(svgContent, svgoConfig);
            if ("data" in result) {
              // 使用新的函数提取所有path路径
              const pathData = extractAllPaths(result.data);

              // 如果没有找到path路径，记录警告并继续
              if (!pathData) {
                console.warn(`警告: 在图标 ${fileName} 中未找到path数据`);
                continue;
              }

              const iconContent = `
import { createIcon } from "../../utils/creator";

export const ${exportName} = createIcon({
  name: "${declareName}",
  path: "${pathData}",
});
    `;
              writeFileSync(resolve(iconSetDir, `${iconFilePathName}.ts`), iconContent);
            }
          } catch (fileError) {
            console.error(`处理文件 ${relativePath} 时出错:`, fileError);
            // 继续处理下一个文件
          }
        }
      }

      // 为每个图标集生成index.ts文件
      if (existsSync(iconSetDir)) {
        const iconFiles = readdirSync(iconSetDir).filter(file => file.endsWith(".ts") && file !== "index.ts");

        if (iconFiles.length > 0) {
          // 生成子文件夹的index.ts
          const subIndexContent = iconFiles.map(file => `export * from './${file.replace(".ts", "")}';`).join("\n");

          writeFileSync(resolve(iconSetDir, "index.ts"), subIndexContent);
        }
      }
    }

    // 生成主索引文件
    const mainIndexContent = `
/**
 * 此文件由图标生成脚本自动更新
 * 请勿手动修改
 */

${icons
  .map(iconSet => {
    const iconSetDir = resolve(ICONS_DIR, iconSet.id);
    if (existsSync(iconSetDir) && existsSync(resolve(iconSetDir, "index.ts"))) {
      return `export * from './${iconSet.id}';`;
    }
    return `// 图标集 ${iconSet.id} 未生成`;
  })
  .join("\n")}
`;

    writeFileSync(resolve(ICONS_DIR, "index.ts"), mainIndexContent);

    console.log("Icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generate();

//#region 测试

// 测试特定SVG文件的解析
function testSpecificSvg(svgFilePath: string): void {
  try {
    // 获取文件名部分
    const fileName = svgFilePath.split(/[/\\]/).pop() || "";
    console.log(`测试解析文件: ${fileName}`);

    const svgContent = readFileSync(svgFilePath, "utf-8");
    console.log("原始SVG内容:", svgContent);
    console.log("原始SVG内容长度:", svgContent.length);

    const result = optimize(svgContent, svgoConfig);
    if ("data" in result) {
      console.log("优化后SVG内容:", result.data);
      console.log("优化后SVG内容长度:", result.data.length);

      const pathData = extractAllPaths(result.data);
      console.log("提取的path数据长度:", pathData.length);
      console.log("提取的path数据:", pathData.substring(0, 100) + "...");

      if (!pathData) {
        console.warn("警告: 未找到path数据");
      }
    } else {
      console.error("优化SVG失败:", result);
    }
  } catch (error) {
    console.error("测试SVG时出错:", error);
  }
}

// 如果需要测试特定文件，取消下面这行的注释并修改路径
// testSpecificSvg(resolve(ASSETS_DIR, "test-rect.svg")); // 使用包含rect元素的测试文件

// 测试矩形SVG转换
function testRectSvg() {
  const rectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
  <rect width="10" height="10" x="1" y="1" fill-rule="evenodd" stroke="#000" rx="1"/>
</svg>`;

  console.log("===== 测试矩形SVG转换 =====");
  console.log("原始SVG:", rectSvg);

  const result = optimize(rectSvg, svgoConfig);
  if ("data" in result) {
    console.log("优化后SVG:", result.data);

    const pathData = extractAllPaths(result.data);
    if (pathData) {
      console.log("提取的path数据:", pathData);
      console.log("转换成功!");
    } else {
      console.warn("转换失败: 未能提取path数据");
    }
  } else {
    console.error("优化SVG失败:", result);
  }
  console.log("===== 测试结束 =====\n");
}

// 如果需要测试矩形SVG转换，取消下面这行的注释
// testRectSvg();

//#endregion
