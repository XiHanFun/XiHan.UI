import { resolve } from "path";
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from "fs";
import { icons } from "../source";
import { SOURCE_PACKS_DIR, ICONS_PACKS_DIR, TYPES_DIR } from "../source/path";
import { getIconFiles, convertSVG } from "./utils";
import {
  indexDefImportTemplate,
  indexDtsTemplate,
  indexMjsImportTemplate,
  indexMjsTemplate,
  indexPackageJsonTemplate,
  packsIndexPackageJsonTemplate,
  mainIndexTemplate,
} from "./templates";

const excludes = ["fa-font-awesome-logo-full"];
const indexDts = "index.d.ts";
const indexMjs = "index.mjs";
const packageJson = "package.json";

/**
 * 初始化目录结构
 */
export async function dirInit(): Promise<void> {
  // 删除旧的生成文件
  if (existsSync(ICONS_PACKS_DIR)) {
    rmSync(ICONS_PACKS_DIR, { recursive: true, force: true });
  }

  const writeFile = (filePath: string, str: string) => writeFileSync(resolve(ICONS_PACKS_DIR, filePath), str, "utf8");

  // 创建新的目录结构
  mkdirSync(ICONS_PACKS_DIR, { recursive: true });
  mkdirSync(TYPES_DIR, { recursive: true });

  // 为每个图标集创建目录和基础文件
  for (const iconSet of icons) {
    mkdirSync(resolve(ICONS_PACKS_DIR, iconSet.id), { recursive: true });

    // 创建基础文件 index.d.ts、index.mjs、package.json、packs/package.json
    writeFile(`${iconSet.id}/${indexDts}`, indexDefImportTemplate);
    writeFile(`${iconSet.id}/${indexMjs}`, indexMjsImportTemplate);
    writeFile(`${iconSet.id}/${packageJson}`, indexPackageJsonTemplate);
  }
}

/**
 * 写入图标模块
 */
export async function writeIconModule(iconSet: (typeof icons)[0]): Promise<void> {
  const exists = new Set<string>(); // 去重
  let iconNum = 0;

  // 基础路径
  const basePath = resolve(SOURCE_PACKS_DIR, iconSet.source.localName, iconSet.source.subFolders);

  // 处理图标集的每个内容配置
  for (const content of iconSet.contents) {
    // 查找图标包路径
    const iconPath = resolve(basePath, content.subFolders);
    const iconFiles = await getIconFiles(iconPath, content.fileFilter);

    if (iconFiles.length === 0) {
      console.warn(`警告: 在 ${iconPath} 中未找到与模式 "${content.fileFilter}" 匹配的 SVG 文件`);
      continue;
    }

    console.log(`处理 ${iconFiles.length} 个图标文件 (${iconSet.name})`);

    // 处理每个 SVG 文件
    for (const relativePath of iconFiles) {
      try {
        // 移除 & 和 | 等特殊字符
        const fileName = relativePath.split(/[/\\]/).pop() || "";
        const baseName = fileName.replace(".svg", "").replace("&", "and").replace("|", "or");

        // 使用配置的 formatter 格式化图标名称
        const name = content.formatter(baseName);

        // 使用配置的 exportName 生成导出名称
        const exportName = content.exportName(name);
        const declareName = content.declareName(name);

        if (excludes.includes(name)) continue;
        if (exists.has(declareName)) continue; // 去重
        exists.add(declareName);

        // 读取和转换 SVG
        const svgContent = readFileSync(resolve(iconPath, relativePath), "utf-8");
        const iconData = await convertSVG(1, declareName, "", svgContent);

        // 写入 index.d.ts
        writeFileSync(
          resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexDts}`),
          readFileSync(resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexDts}`), "utf8") + indexDtsTemplate(exportName),
          "utf8",
        );

        // 写入 index.mjs
        writeFileSync(
          resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexMjs}`),
          readFileSync(resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexMjs}`), "utf8") +
            indexMjsTemplate(exportName, iconData),
          "utf8",
        );

        iconNum++;
      } catch (fileError) {
        console.error(`处理文件 ${relativePath} 时出错:`, fileError);
        continue;
      }
    }
  }

  // 生成图标集元信息
  if (iconNum > 0) {
    const hasMultiColor = iconSet.contents.some(content => content.multiColor === true);
    const variants = iconSet.contents.length;

    const iconSetInfo = {
      id: iconSet.id,
      name: iconSet.name,
      website: iconSet.website,
      projectUrl: iconSet.projectUrl,
      license: iconSet.license,
      licenseUrl: iconSet.licenseUrl,
      total: iconNum,
      hasMultiColor,
      variants,
    };

    // 写入图标集元信息
    const metaInfo = `
// 图标集元信息
export const ${iconSet.id}Info: IconSetInfo = ${JSON.stringify(iconSetInfo, null, 2)};
`;

    writeFileSync(
      resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexDts}`),
      readFileSync(resolve(ICONS_PACKS_DIR, `${iconSet.id}/${indexDts}`), "utf8") + metaInfo,
      "utf8",
    );
  }

  console.log(`- ${iconNum} 个图标从 ${iconSet.name} 完成`);
}

/**
 * 完成构建
 */
export async function finalizeBuild(): Promise<void> {
  // 创建主索引文件
  const mainContent = mainIndexTemplate(icons.map(icon => ({ id: icon.id, name: icon.name })));
  writeFileSync(resolve(ICONS_PACKS_DIR, indexMjs), mainContent);

  // 创建主 package.json
  writeFileSync(resolve(ICONS_PACKS_DIR, packageJson), packsIndexPackageJsonTemplate);
}
